# Atende: RF-007, RF-008, RF-009, RF-011, RNF-007
"""
Testes unitários para o modelo preditivo multiclasse e MLOps (modelo_preditivo.py).
Compatível com unittest padrão e pytest.
"""

import unittest
import numpy as np
import pandas as pd

from src.core.modelo_preditivo import (
    temporal_train_test_split,
    PredictiveMaintenanceEnsemble,
    prepare_features,
    FEATURE_COLUMNS
)


class TestMLModel(unittest.TestCase):
    def setUp(self):
        """Gera matriz sintética de telemetrias com 4 classes de falha."""
        np.random.seed(42)
        n_samples = 400
        
        data = {
            "timestamp": pd.date_range("2026-10-01 00:00", periods=n_samples, freq="5min"),
            "id_celula": ["CEL-201"] * n_samples,
            "liga_metalica": ["Liga_Titanio_Ti6Al4V"] * n_samples,
            "tipo_falha": [0] * 320 + [1] * 30 + [2] * 25 + [3] * 25
        }
        
        for col in FEATURE_COLUMNS:
            data[col] = np.random.uniform(10.0, 100.0, size=n_samples)
            
        for i in range(320, 350):
            data["vibracao_triaxial_rms_mms"][i] = 15.0
            data["torque_fuso_nm"][i] = 220.0

        for i in range(350, 375):
            data["vazao_refrigerante_lmin"][i] = 1.0
            data["temperatura_fuso_c"][i] = 110.0

        for i in range(375, 400):
            data["pressao_hidraulica_bar"][i] = 260.0
            data["nivel_ruido_db"][i] = 95.0

        self.df = pd.DataFrame(data)

    def test_temporal_train_test_split(self):
        """Verifica divisão estrita 70/30 sem embaralhamento (RF-007)."""
        train_df, test_df = temporal_train_test_split(self.df, train_ratio=0.70)
        self.assertEqual(len(train_df), 280)
        self.assertEqual(len(test_df), 120)
        self.assertTrue(train_df["timestamp"].max() < test_df["timestamp"].min())

    def test_predictive_ensemble_training_and_eval(self):
        """Verifica treino com balanceamento e avaliação multiclasse (RF-008, RF-009, RF-011)."""
        train_df, test_df = temporal_train_test_split(self.df, train_ratio=0.70)
        
        X_train, y_train = prepare_features(train_df)
        X_test, y_test = prepare_features(test_df)
        
        ensemble = PredictiveMaintenanceEnsemble(n_estimators=25, random_state=42)
        train_res = ensemble.train(X_train, y_train)
        
        self.assertIn("rf_feature_importances", train_res)
        self.assertTrue(ensemble.is_trained)
        
        metrics = ensemble.evaluate(X_test, y_test)
        self.assertIn("random_forest", metrics)
        self.assertIn("recall_per_class", metrics["random_forest"])
        self.assertIn("confusion_matrix", metrics["random_forest"])
        
        cls_id, cls_name, conf = ensemble.predict_single(X_test[0])
        self.assertIn(cls_id, [0, 1, 2, 3])
        self.assertIsInstance(cls_name, str)
        self.assertTrue(0.0 <= conf <= 1.0)


if __name__ == "__main__":
    unittest.main()
