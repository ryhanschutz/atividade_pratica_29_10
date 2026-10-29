# Atende: RF-001, RF-002, RF-003, RNF-001, RNF-002
"""
Módulo de saneamento e limpeza estrutural de telemetrias industriais.
Responsabilidades:
- Quantificação de NaNs por célula e liga metálica.
- Remoção de ruídos físicos fora dos limites operacionais.
- Filtro Z-Score condicionado à liga metálica.
- Interpolação temporal condicional por equipamento (id_celula).
"""

from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np


# Limites operacionais normais e limites físicos válidos (conforme especificação da fábrica)
SENSOR_PHYSICAL_LIMITS = {
    "temperatura_fuso_c": {"min": 0.0, "max": 250.0, "noise_values": [999.9]},
    "vibracao_triaxial_rms_mms": {"min": 0.0, "max": 50.0, "noise_values": [-99.0]},
    "torque_fuso_nm": {"min": 0.0, "max": 500.0, "noise_values": []},
    "vazao_refrigerante_lmin": {"min": 0.0, "max": 100.0, "noise_values": []},
    "corrente_estator_amp": {"min": 0.0, "max": 150.0, "noise_values": []},
    "pressao_hidraulica_bar": {"min": 0.0, "max": 400.0, "noise_values": [-1.0]},
    "nivel_ruido_db": {"min": 20.0, "max": 140.0, "noise_values": []},
}


def quantify_missing_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Quantifica a taxa de ausência de dados (NaNs) agrupada por id_celula e liga_metalica.
    Atende: RF-001
    """
    sensor_cols = [col for col in SENSOR_PHYSICAL_LIMITS.keys() if col in df.columns]
    
    records = []
    grouped = df.groupby(["id_celula", "liga_metalica"])
    
    for (celula, liga), group in grouped:
        total_rows = len(group)
        nan_counts = group[sensor_cols].isna().sum()
        for col in sensor_cols:
            count_nan = int(nan_counts[col])
            records.append({
                "id_celula": celula,
                "liga_metalica": liga,
                "sensor": col,
                "total_amostras": total_rows,
                "nans": count_nan,
                "percentual_ausencia": round((count_nan / total_rows) * 100, 2) if total_rows > 0 else 0.0
            })
            
    return pd.DataFrame(records)


def filter_physical_noise(df: pd.DataFrame) -> pd.DataFrame:
    """
    Substitui leituras de ruídos físicos extremos (-99.0, 999.9, -1.0) e valores
    fora dos limites operacionais plausíveis por NaN para posterior interpolação.
    Atende: RF-003
    """
    df_clean = df.copy()
    
    for col, limits in SENSOR_PHYSICAL_LIMITS.items():
        if col in df_clean.columns:
            # Substitui valores de ruído explícitos
            for noise_val in limits["noise_values"]:
                df_clean.loc[np.isclose(df_clean[col], noise_val, atol=1e-2), col] = np.nan
            
            # Substitui valores fora dos limites físicos plausíveis
            df_clean.loc[df_clean[col] < limits["min"], col] = np.nan
            df_clean.loc[df_clean[col] > limits["max"], col] = np.nan
            
    return df_clean


def filter_conditional_zscore(
    df: pd.DataFrame, 
    threshold: float = 4.0
) -> pd.DataFrame:
    """
    Detecta outliers anômalos através do Z-Score condicionado à liga metálica
    e substitui por NaN.
    Atende: RF-003
    """
    df_clean = df.copy()
    sensor_cols = [col for col in SENSOR_PHYSICAL_LIMITS.keys() if col in df_clean.columns]
    
    for col in sensor_cols:
        # Calcula Z-Score condicionado por liga metálica
        mean = df_clean.groupby("liga_metalica")[col].transform("mean")
        std = df_clean.groupby("liga_metalica")[col].transform("std")
        
        # Evita divisão por zero se o desvio padrão for nulo
        std_safe = std.replace(0, np.nan)
        zscore = (df_clean[col] - mean).abs() / std_safe
        
        # Marca como NaN valores que excedem o threshold de Z-Score
        df_clean.loc[zscore > threshold, col] = np.nan
        
    return df_clean


def interpolate_conditional_temporal(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aplica interpolação temporal condicional por equipamento (id_celula).
    Garante que células diferentes não misturem séries temporais.
    Atende: RF-002
    """
    df_interp = df.copy()
    
    if "timestamp" in df_interp.columns:
        df_interp["timestamp"] = pd.to_datetime(df_interp["timestamp"])
        df_interp = df_interp.sort_values(by=["id_celula", "timestamp"]).reset_index(drop=True)
    
    sensor_cols = [col for col in SENSOR_PHYSICAL_LIMITS.keys() if col in df_interp.columns]
    
    # Interpolação linear temporal agrupada por id_celula
    df_interp[sensor_cols] = (
        df_interp.groupby("id_celula")[sensor_cols]
        .transform(lambda grp: grp.interpolate(method="linear").bfill().ffill())
    )
    
    return df_interp


def sanitize_pipeline(df: pd.DataFrame) -> pd.DataFrame:
    """
    Executa o pipeline completo de saneamento industrial:
    1. Filtro de ruídos físicos (-99.0, 999.9, -1.0)
    2. Filtro de Z-Score condicional por liga metálica
    3. Interpolação temporal condicional por equipamento (id_celula)
    Atende: RF-001, RF-002, RF-003
    """
    cleaned = filter_physical_noise(df)
    cleaned = filter_conditional_zscore(cleaned, threshold=4.5)
    sanitized = interpolate_conditional_temporal(cleaned)
    return sanitized
