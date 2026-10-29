# Atende: RF-014, RF-015, RF-016, RNF-001, RNF-002, RNF-004
"""
Ponto de entrada único da aplicação VulcanTech Smart Metals S.A.
Responsabilidades:
- Inicialização do ciclo de vida da API FastAPI.
- Carregamento do pipeline de machine learning pré-treinado.
- Fallback para treinamento automático caso o modelo não exista.
- Inicialização do servidor Uvicorn.
"""

import sys
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional
from fastapi import FastAPI
import uvicorn
import pandas as pd

from src.config.configuracoes import settings
from src.adapters.storage.armazenamento_modelo import load_pipeline, save_pipeline
from src.adapters.api.rotas import router as api_router
from src.core.limpeza_dados import sanitize_pipeline
from src.core.engenharia_features import feature_engineering_pipeline
from src.core.modelo_preditivo import (
    PredictiveMaintenanceEnsemble,
    temporal_train_test_split,
    prepare_features
)


# Configuração de logging estruturado
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("vulcantech.main")

# Contexto global do modelo em memória (consumo leve < 150 MB)
MODEL_PIPELINE: Optional[Dict[str, Any]] = None


def initialize_or_train_model():
    """Carrega o modelo do disco ou treina a partir do dataset CSV se não existir."""
    global MODEL_PIPELINE
    logger.info("Verificando modelo preditivo...")
    
    loaded = load_pipeline(settings.MODEL_PATH)
    if loaded is not None:
        logger.info(f"Modelo carregado com sucesso de: {settings.MODEL_PATH}")
        MODEL_PIPELINE = loaded
        return

    logger.warning("Modelo não encontrado em disco. Executando pipeline de treinamento inicial...")
    if not settings.DATASET_PATH.exists():
        logger.error(f"Dataset não encontrado em: {settings.DATASET_PATH}")
        # Inicializa ensemble básico não treinado
        dummy = PredictiveMaintenanceEnsemble()
        MODEL_PIPELINE = {"model": dummy, "historical_means": {}}
        return

    # Pipeline de Dados: Leitura, Saneamento, Features e Treinamento
    df_raw = pd.read_csv(settings.DATASET_PATH)
    logger.info(f"Dataset carregado ({len(df_raw)} registros). Saneando...")
    df_clean = sanitize_pipeline(df_raw)
    
    logger.info("Computando engenharia de features dinâmicas por liga...")
    df_feat, historical_means = feature_engineering_pipeline(df_clean)
    
    logger.info("Particionamento temporal 70% treino / 30% teste...")
    train_df, test_df = temporal_train_test_split(df_feat, train_ratio=0.70)
    
    X_train, y_train = prepare_features(train_df)
    X_test, y_test = prepare_features(test_df)
    
    ensemble = PredictiveMaintenanceEnsemble(n_estimators=100)
    logger.info("Treinando algoritmos ensemble com balanceamento de classes...")
    ensemble.train(X_train, y_train)
    
    logger.info("Avaliando modelo preditivo...")
    eval_metrics = ensemble.evaluate(X_test, y_test)
    logger.info(f"Acurácia geral: {eval_metrics['random_forest']['overall_accuracy']:.4f}")
    for cls_name, rec in eval_metrics['random_forest']['recall_per_class'].items():
        logger.info(f"  Recall [{cls_name}]: {rec*100:.2f}%")
        
    pipeline_data = {
        "model": ensemble,
        "historical_means": historical_means,
        "metrics": eval_metrics
    }
    save_pipeline(pipeline_data, settings.MODEL_PATH)
    logger.info(f"Modelo salvo em: {settings.MODEL_PATH}")
    MODEL_PIPELINE = pipeline_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerenciamento de inicialização e encerramento assíncrono."""
    initialize_or_train_model()
    yield
    logger.info("Encerrando aplicação VulcanTech...")


app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="Microserviço Edge de Manufatura Inteligente: IA Preditiva, OEE e Visão Computacional.",
    lifespan=lifespan
)

app.include_router(api_router)


def run():
    """Função para inicialização via linha de comando."""
    uvicorn.run(
        "src.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )


if __name__ == "__main__":
    run()
