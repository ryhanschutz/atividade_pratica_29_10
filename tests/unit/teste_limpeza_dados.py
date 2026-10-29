# Atende: RF-001, RF-002, RF-003, RNF-007
"""
Testes unitários para o módulo de saneamento e limpeza de dados (limpeza_dados.py).
Compatível com unittest padrão e pytest.
"""

import unittest
import pandas as pd
import numpy as np

from src.core.limpeza_dados import (
    quantify_missing_data,
    filter_physical_noise,
    filter_conditional_zscore,
    interpolate_conditional_temporal,
    sanitize_pipeline
)


class TestDataCleaning(unittest.TestCase):
    def setUp(self):
        """Gera dataframe de teste com ruídos conhecidos e NaNs."""
        self.sample_raw_df = pd.DataFrame({
            "timestamp": [
                "2026-10-01 00:00:00",
                "2026-10-01 00:05:00",
                "2026-10-01 00:10:00",
                "2026-10-01 00:15:00"
            ],
            "id_celula": ["CEL-201", "CEL-201", "CEL-201", "CEL-201"],
            "liga_metalica": ["Liga_Titanio_Ti6Al4V"] * 4,
            "temperatura_fuso_c": [50.0, 999.9, np.nan, 52.0],
            "vibracao_triaxial_rms_mms": [1.5, -99.0, 1.8, 2.0],
            "torque_fuso_nm": [120.0, 122.0, 125.0, 121.0],
            "vazao_refrigerante_lmin": [25.0, np.nan, 26.0, 25.5],
            "corrente_estator_amp": [28.0, 29.0, 30.0, 28.5],
            "pressao_hidraulica_bar": [150.0, -1.0, 152.0, 151.0],
            "nivel_ruido_db": [60.0, 61.0, 62.0, 60.5]
        })

    def test_quantify_missing_data(self):
        """Verifica se quantifica corretamente os NaNs por célula e liga (RF-001)."""
        df_nans = quantify_missing_data(self.sample_raw_df)
        self.assertFalse(df_nans.empty)
        self.assertIn("percentual_ausencia", df_nans.columns)
        
        temp_row = df_nans[df_nans["sensor"] == "temperatura_fuso_c"].iloc[0]
        self.assertEqual(temp_row["nans"], 1)
        self.assertEqual(temp_row["percentual_ausencia"], 25.0)

    def test_filter_physical_noise(self):
        """Verifica se ruídos extremos (-99.0, 999.9, -1.0) viram NaN (RF-003)."""
        cleaned = filter_physical_noise(self.sample_raw_df)
        self.assertTrue(np.isnan(cleaned.loc[1, "temperatura_fuso_c"]))
        self.assertTrue(np.isnan(cleaned.loc[1, "vibracao_triaxial_rms_mms"]))
        self.assertTrue(np.isnan(cleaned.loc[1, "pressao_hidraulica_bar"]))

    def test_interpolate_conditional_temporal(self):
        """Verifica se a interpolação temporal por célula preenche NaNs (RF-002)."""
        cleaned = filter_physical_noise(self.sample_raw_df)
        interpolated = interpolate_conditional_temporal(cleaned)
        
        sensor_cols = [
            "temperatura_fuso_c", "vibracao_triaxial_rms_mms", 
            "vazao_refrigerante_lmin", "pressao_hidraulica_bar"
        ]
        for col in sensor_cols:
            self.assertEqual(interpolated[col].isna().sum(), 0, f"Coluna {col} ainda possui NaNs")

    def test_sanitize_pipeline_end_to_end(self):
        """Testa o pipeline integrado de saneamento industrial."""
        sanitized = sanitize_pipeline(self.sample_raw_df)
        self.assertIsNotNone(sanitized)
        self.assertEqual(len(sanitized), 4)
        self.assertTrue((sanitized["vibracao_triaxial_rms_mms"] > 0).all())
        self.assertTrue((sanitized["temperatura_fuso_c"] < 100.0).all())
        self.assertTrue((sanitized["pressao_hidraulica_bar"] > 0).all())


if __name__ == "__main__":
    unittest.main()
