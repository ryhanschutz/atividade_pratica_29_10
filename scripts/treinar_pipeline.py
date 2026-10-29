# Atende: RF-001 a RF-018
"""
Script de treinamento e serialização do modelo preditivo para nó Edge.
Executa o pipeline completo:
1. Carregamento dos dados brutos
2. Saneamento físico e interpolação temporal por célula
3. Engenharia de features dinâmicas por liga
4. Particionamento temporal 70/30
5. Treinamento do Ensemble balanceado
6. Avaliação e persistência do modelo
"""

import sys
import os
from pathlib import Path
import pandas as pd

# Adiciona o diretório raiz ao PYTHONPATH
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from src.config.configuracoes import settings
from src.core.limpeza_dados import sanitize_pipeline
from src.core.engenharia_features import feature_engineering_pipeline
from src.core.modelo_preditivo import (
    PredictiveMaintenanceEnsemble,
    temporal_train_test_split,
    prepare_features
)
from src.adapters.storage.armazenamento_modelo import save_pipeline


def main():
    print("[1/5] Lendo base de dados bruta...")
    if not settings.DATASET_PATH.exists():
        print(f"Erro: Arquivo {settings.DATASET_PATH} não encontrado.")
        sys.exit(1)
        
    df_raw = pd.read_csv(settings.DATASET_PATH)
    print(f"      Total de amostras carregadas: {len(df_raw)}")

    print("[2/5] Saneando dados e interpolando por célula...")
    df_clean = sanitize_pipeline(df_raw)

    print("[3/5] Calculando IEM, normalização por liga e janelas móveis...")
    df_feat, historical_means = feature_engineering_pipeline(df_clean)

    print("[4/5] Realizando divisão temporal (70% treino / 30% teste)...")
    train_df, test_df = temporal_train_test_split(df_feat, train_ratio=0.70)
    X_train, y_train = prepare_features(train_df)
    X_test, y_test = prepare_features(test_df)
    print(f"      Treino: {len(X_train)} amostras | Teste: {len(X_test)} amostras")

    print("[5/5] Treinando Ensemble com pesos balanceados e avaliando...")
    ensemble = PredictiveMaintenanceEnsemble(n_estimators=100, random_state=42)
    ensemble.train(X_train, y_train)
    
    metrics = ensemble.evaluate(X_test, y_test)
    rf_eval = metrics["random_forest"]
    print(f"\n>>> Acurácia Global: {rf_eval['overall_accuracy']*100:.2f}%")
    print(">>> Recall por Classe de Falha:")
    for cls_name, rec in rf_eval["recall_per_class"].items():
        print(f"    - {cls_name}: {rec*100:.2f}%")
        
    pipeline_data = {
        "model": ensemble,
        "historical_means": historical_means,
        "metrics": metrics
    }
    saved_path = save_pipeline(pipeline_data, settings.MODEL_PATH)
    print(f"\nModelo serializado salvo com sucesso em: {saved_path}")


if __name__ == "__main__":
    main()
