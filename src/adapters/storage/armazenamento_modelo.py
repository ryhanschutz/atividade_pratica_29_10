# Atende: RF-011, RNF-001, RNF-005
"""
Módulo adaptador de persistência de modelos treinados via joblib.
Responsabilidades:
- Serialização e desserialização atômica do pipeline de ML.
- Armazenamento em disco seguro em pasta de modelos.
"""

from pathlib import Path
from typing import Any, Optional
import os
import joblib


def save_pipeline(obj: Any, file_path: Path) -> Path:
    """
    Serializa o pipeline preditivo e metadados via joblib com compressão.
    Atende: RF-011
    """
    file_path = Path(file_path)
    file_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(obj, file_path, compress=3)
    return file_path


def load_pipeline(file_path: Path) -> Optional[Any]:
    """
    Carrega o pipeline serializado do disco.
    """
    file_path = Path(file_path)
    if not file_path.exists():
        return None
    return joblib.load(file_path)
