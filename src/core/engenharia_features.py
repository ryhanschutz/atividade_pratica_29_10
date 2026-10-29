# Atende: RF-004, RF-005, RF-006, RNF-001, RNF-002
"""
Módulo de engenharia de features dinâmicas por lote e física do processo.
Responsabilidades:
- Cálculo do Índice de Esforço Mecânico (IEM).
- Normalização de variáveis de processo pela média histórica da liga metálica.
- Criação de janelas móveis (Rolling Mean e Rolling Std) de 30 minutos e 2 horas.
"""

from typing import List, Dict, Optional
import pandas as pd
import numpy as np


def compute_mechanical_effort_index(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calcula a feature derivada Índice de Esforço Mecânico (IEM):
    IEM = (Torque_Fuso * Vibracao_RMS) / (Vazao_Refrigerante + 1.0)
    Atende: RF-005
    """
    df_out = df.copy()
    torque = df_out["torque_fuso_nm"]
    vibracao = df_out["vibracao_triaxial_rms_mms"]
    vazao = df_out["vazao_refrigerante_lmin"]
    
    # Prevenção de divisão por zero ou negativos adicionando + 1.0 conforme fórmula do PDF
    df_out["iem"] = (torque * vibracao) / (np.maximum(vazao, 0.0) + 1.0)
    return df_out


def normalize_by_metal_alloy(
    df: pd.DataFrame, 
    historical_means: Optional[Dict[str, Dict[str, float]]] = None
) -> (pd.DataFrame, Dict[str, Dict[str, float]]):
    """
    Normaliza as variáveis de processo dividindo-as pela média histórica da respectiva liga metálica.
    Elimina falsos alarmes em materiais de alta dureza (ex.: Titânio).
    Atende: RF-006
    """
    df_out = df.copy()
    cols_to_normalize = [
        "temperatura_fuso_c",
        "vibracao_triaxial_rms_mms",
        "torque_fuso_nm",
        "corrente_estator_amp",
        "nivel_ruido_db"
    ]
    
    valid_cols = [c for c in cols_to_normalize if c in df_out.columns]
    
    if historical_means is None:
        historical_means = {}
        for liga, grp in df_out.groupby("liga_metalica"):
            historical_means[liga] = {}
            for col in valid_cols:
                mean_val = float(grp[col].mean())
                # Evita divisão por zero
                historical_means[liga][col] = mean_val if abs(mean_val) > 1e-6 else 1.0

    for col in valid_cols:
        norm_col_name = f"{col}_norm_liga"
        # Mapeia a média de cada liga e normaliza
        means_series = df_out["liga_metalica"].map(
            lambda l: historical_means.get(l, {}).get(col, 1.0)
        )
        means_series = means_series.replace(0, 1.0)
        df_out[norm_col_name] = df_out[col] / means_series

    return df_out, historical_means


def compute_rolling_features(
    df: pd.DataFrame,
    window_30m: int = 6,
    window_2h: int = 24
) -> pd.DataFrame:
    """
    Calcula médias móveis (Rolling Mean) e desvios padrão (Rolling Std)
    em janelas de 30 min (6 passos de 5min) e 2 horas (24 passos de 5min) por id_celula.
    Atende: RF-004
    """
    df_out = df.copy()
    
    if "timestamp" in df_out.columns:
        df_out["timestamp"] = pd.to_datetime(df_out["timestamp"])
        df_out = df_out.sort_values(by=["id_celula", "timestamp"]).reset_index(drop=True)

    base_cols = ["temperatura_fuso_c", "vibracao_triaxial_rms_mms", "iem"]
    valid_cols = [c for c in base_cols if c in df_out.columns]
    
    grouped = df_out.groupby("id_celula")
    
    for col in valid_cols:
        # Janela 30m
        df_out[f"{col}_rolling_mean_30m"] = grouped[col].transform(
            lambda s: s.rolling(window=window_30m, min_periods=1).mean()
        )
        df_out[f"{col}_rolling_std_30m"] = grouped[col].transform(
            lambda s: s.rolling(window=window_30m, min_periods=1).std().fillna(0.0)
        )
        
        # Janela 2h
        df_out[f"{col}_rolling_mean_2h"] = grouped[col].transform(
            lambda s: s.rolling(window=window_2h, min_periods=1).mean()
        )
        df_out[f"{col}_rolling_std_2h"] = grouped[col].transform(
            lambda s: s.rolling(window=window_2h, min_periods=1).std().fillna(0.0)
        )
        
    return df_out


def feature_engineering_pipeline(
    df: pd.DataFrame, 
    historical_means: Optional[Dict[str, Dict[str, float]]] = None
) -> (pd.DataFrame, Dict[str, Dict[str, float]]):
    """
    Executa o pipeline integrado de engenharia de features:
    1. Índice de Esforço Mecânico (IEM)
    2. Normalização por liga metálica
    3. Janelas móveis dinâmicas (30m e 2h)
    Atende: RF-004, RF-005, RF-006
    """
    df_iem = compute_mechanical_effort_index(df)
    df_norm, means = normalize_by_metal_alloy(df_iem, historical_means)
    df_final = compute_rolling_features(df_norm)
    return df_final, means
