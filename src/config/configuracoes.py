# Atende: RNF-004, RNF-005
"""
Módulo de configurações e variáveis de ambiente (12-Factor App).
Responsabilidades:
- Leitura segura de variáveis com fallbacks industriais padrão.
- Isola caminhos de modelos serializados e datasets.
- Sem credenciais fixas no código.
"""

import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings:
    """Configurações centrais do sistema."""
    # API & Network
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    API_TITLE: str = "VulcanTech Smart Metals - Closed-Loop Predictive & Vision API"
    API_VERSION: str = "0.1.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # Paths
    DATA_DIR: Path = BASE_DIR / "data"
    SAMPLES_DIR: Path = DATA_DIR / "samples"
    MODEL_PATH: Path = BASE_DIR / "data" / "models" / "predictive_model.joblib"
    DATASET_PATH: Path = BASE_DIR / "dados_sensores_vulcantech.csv"

    # Edge Thresholds
    MIN_CONFIDENCE_THRESHOLD: float = float(os.getenv("MIN_CONFIDENCE_THRESHOLD", "0.50"))


settings = Settings()
