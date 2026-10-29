# Atende: RF-004, RF-005, RF-006, RNF-007
"""
Testes unitários para engenharia de features dinâmicas por lote (engenharia_features.py).
Compatível com unittest padrão e pytest.
"""

import unittest
import pandas as pd
import numpy as np

from src.core.engenharia_features import (
    compute_mechanical_effort_index,
    normalize_by_metal_alloy,
    compute_rolling_features,
    feature_engineering_pipeline
)


class TestFeatureEngineering(unittest.TestCase):
    def setUp(self):
        """Gera dados limpos para cálculo de features."""
        self.clean_df = pd.DataFrame({
            "timestamp": pd.date_range("2026-10-01 00:00", periods=30, freq="5min"),
            "id_celula": ["CEL-201"] * 30,
            "liga_metalica": ["Liga_Titanio_Ti6Al4V"] * 15 + ["Aluminio_7075"] * 15,
            "temperatura_fuso_c": [50.0 + i * 0.5 for i in range(30)],
            "vibracao_triaxial_rms_mms": [1.5 + (i % 3) * 0.2 for i in range(30)],
            "torque_fuso_nm": [100.0] * 30,
            "vazao_refrigerante_lmin": [20.0] * 30,
            "corrente_estator_amp": [30.0] * 30,
            "pressao_hidraulica_bar": [160.0] * 30,
            "nivel_ruido_db": [65.0] * 30
        })

    def test_compute_mechanical_effort_index(self):
        """Verifica se a fórmula do IEM é estritamente satisfeita (RF-005)."""
        df_iem = compute_mechanical_effort_index(self.clean_df)
        self.assertIn("iem", df_iem.columns)
        
        # IEM = (Torque * Vibracao) / (Vazao + 1)
        expected = (100.0 * 1.5) / (20.0 + 1.0)
        self.assertAlmostEqual(df_iem.loc[0, "iem"], expected, places=3)

    def test_normalize_by_metal_alloy(self):
        """Verifica normalização pela média histórica da liga (RF-006)."""
        df_norm, means = normalize_by_metal_alloy(self.clean_df)
        
        self.assertIn("temperatura_fuso_c_norm_liga", df_norm.columns)
        self.assertIn("Liga_Titanio_Ti6Al4V", means)
        self.assertIn("Aluminio_7075", means)
        
        for liga in ["Liga_Titanio_Ti6Al4V", "Aluminio_7075"]:
            sub_mean = df_norm[df_norm["liga_metalica"] == liga]["temperatura_fuso_c_norm_liga"].mean()
            self.assertAlmostEqual(sub_mean, 1.0, places=2)

    def test_compute_rolling_features(self):
        """Verifica janelas móveis de 30m e 2h (RF-004)."""
        df_iem = compute_mechanical_effort_index(self.clean_df)
        df_rolling = compute_rolling_features(df_iem, window_30m=6, window_2h=24)
        
        self.assertIn("temperatura_fuso_c_rolling_mean_30m", df_rolling.columns)
        self.assertIn("temperatura_fuso_c_rolling_std_30m", df_rolling.columns)
        self.assertIn("temperatura_fuso_c_rolling_mean_2h", df_rolling.columns)
        self.assertIn("temperatura_fuso_c_rolling_std_2h", df_rolling.columns)
        self.assertFalse(df_rolling["temperatura_fuso_c_rolling_mean_30m"].isna().any())


if __name__ == "__main__":
    unittest.main()
