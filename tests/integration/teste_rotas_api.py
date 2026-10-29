# Atende: RF-014, RF-015, RF-016, RNF-001, RNF-003, RNF-007
"""
Testes de integração para os endpoints RESTful da API FastAPI.
Compatível com unittest padrão e pytest.
"""

import unittest
import io
import numpy as np
import cv2
from fastapi.testclient import TestClient

from src.main import app
from src.core.modelo_preditivo import PredictiveMaintenanceEnsemble, FEATURE_COLUMNS


class TestAPIRoutes(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Inicializa um modelo leve para testes da API."""
        np.random.seed(42)
        X = np.random.uniform(10.0, 100.0, size=(100, len(FEATURE_COLUMNS)))
        y = np.array([0] * 70 + [1] * 10 + [2] * 10 + [3] * 10)
        
        ensemble = PredictiveMaintenanceEnsemble(n_estimators=10, random_state=42)
        ensemble.train(X, y)
        
        import src.main as main_mod
        main_mod.MODEL_PIPELINE = {
            "model": ensemble,
            "historical_means": {
                "Liga_Titanio_Ti6Al4V": {
                    "temperatura_fuso_c": 50.0,
                    "vibracao_triaxial_rms_mms": 2.0,
                    "torque_fuso_nm": 120.0,
                    "corrente_estator_amp": 30.0,
                    "nivel_ruido_db": 65.0
                }
            }
        }
        cls.client = TestClient(app)

    def test_get_health(self):
        """Testa checagem de saúde e consumo de recursos (RF-016, RNF-001)."""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertGreater(data["memoria_ram_mb"], 0)
        self.assertTrue(data["modelo_carregado"])

    def test_post_predict_single(self):
        """Testa inferência em tempo real e retorno de ação industrial (RF-014)."""
        payload = {
            "id_celula": "CEL-201",
            "liga_metalica": "Liga_Titanio_Ti6Al4V",
            "temperatura_fuso_c": 55.0,
            "vibracao_triaxial_rms_mms": 2.2,
            "torque_fuso_nm": 125.0,
            "vazao_refrigerante_lmin": 25.0,
            "corrente_estator_amp": 32.0,
            "pressao_hidraulica_bar": 160.0,
            "nivel_ruido_db": 62.0
        }
        response = self.client.post("/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["id_celula"], "CEL-201")
        self.assertIn(data["codigo_falha"], [0, 1, 2, 3])
        self.assertIn(data["acao_industrial_recomendada"], [
            "MANTER_OPERACAO", "REDUZIR_VELOCIDADE_50%", "INTERROMPER_EMERGENCIA"
        ])
        self.assertIn("impacto_oee", data)
        self.assertIn("oee_calculado", data["impacto_oee"])

    def test_post_predict_batch(self):
        """Testa inferência em lote para múltiplos sensores (RF-015)."""
        item1 = {
            "id_celula": "CEL-201",
            "liga_metalica": "Liga_Titanio_Ti6Al4V",
            "temperatura_fuso_c": 55.0,
            "vibracao_triaxial_rms_mms": 2.2,
            "torque_fuso_nm": 125.0,
            "vazao_refrigerante_lmin": 25.0,
            "corrente_estator_amp": 32.0,
            "pressao_hidraulica_bar": 160.0,
            "nivel_ruido_db": 62.0
        }
        item2 = {
            "id_celula": "CEL-202",
            "liga_metalica": "Liga_Titanio_Ti6Al4V",
            "temperatura_fuso_c": 80.0,
            "vibracao_triaxial_rms_mms": 4.5,
            "torque_fuso_nm": 210.0,
            "vazao_refrigerante_lmin": 5.0,
            "corrente_estator_amp": 50.0,
            "pressao_hidraulica_bar": 170.0,
            "nivel_ruido_db": 85.0
        }
        payload = {"items": [item1, item2]}
        response = self.client.post("/predict-batch", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_processado"], 2)
        self.assertEqual(len(data["predicoes"]), 2)

    def test_post_vision_inspect_weld(self):
        """Testa endpoint de inspeção óptica via upload de imagem (RF-012)."""
        img = np.full((100, 200, 3), 50, dtype=np.uint8)
        cv2.rectangle(img, (20, 40), (180, 60), (200, 200, 200), -1)
        _, buffer = cv2.imencode(".png", img)
        
        file_bytes = io.BytesIO(buffer.tobytes())
        response = self.client.post(
            "/vision/inspect-weld",
            files={"file": ("weld.png", file_bytes, "image/png")}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("status_cordao", data)
        self.assertIn("taxa_porosidade_percentual", data)

    def test_post_vision_analyze_haz(self):
        """Testa endpoint de termografia HAZ via upload de imagem (RF-013)."""
        img = np.zeros((100, 100, 3), dtype=np.uint8)
        img[:, :] = (255, 0, 0)
        _, buffer = cv2.imencode(".png", img)
        
        file_bytes = io.BytesIO(buffer.tobytes())
        response = self.client.post(
            "/vision/analyze-haz",
            files={"file": ("haz.png", file_bytes, "image/png")}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("status_haz", data)
        self.assertIn("percentual_area_sobreaquecida", data)


if __name__ == "__main__":
    unittest.main()
