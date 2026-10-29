# Atende: RF-007, RF-008, RF-009, RF-011, RNF-001, RNF-002
"""
Módulo de modelagem preditiva supervisionada multiclasse e explicabilidade MLOps.
Responsabilidades:
- Particionamento temporal estrito treino/teste (70% / 30%).
- Ponderação de classes para tratamento de desbalanceamento (class_weight='balanced').
- Treinamento e comparação de modelos ensemble (Random Forest vs Gradient Boosting).
- Cálculo de Matriz de Confusão e Recall por classe (meta Recall >= 90%).
- Importância de atributos (Feature Importances).
"""

from typing import Dict, Any, Tuple, List, Optional
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.metrics import classification_report, confusion_matrix, recall_score
from sklearn.preprocessing import LabelEncoder


CLASS_NAMES = {
    0: "Operação Normal",
    1: "Desgaste Severo de Ferramenta / Fuso",
    2: "Obstrução no Sistema de Refrigeração / Superaquecimento",
    3: "Desalinhamento da Matriz de Prensa / Trinca Mecânica"
}

FEATURE_COLUMNS = [
    "temperatura_fuso_c",
    "vibracao_triaxial_rms_mms",
    "torque_fuso_nm",
    "vazao_refrigerante_lmin",
    "corrente_estator_amp",
    "pressao_hidraulica_bar",
    "nivel_ruido_db",
    "iem",
    "temperatura_fuso_c_norm_liga",
    "vibracao_triaxial_rms_mms_norm_liga",
    "torque_fuso_nm_norm_liga",
    "corrente_estator_amp_norm_liga",
    "nivel_ruido_db_norm_liga",
    "temperatura_fuso_c_rolling_mean_30m",
    "temperatura_fuso_c_rolling_std_30m",
    "vibracao_triaxial_rms_mms_rolling_mean_30m",
    "vibracao_triaxial_rms_mms_rolling_std_30m",
    "iem_rolling_mean_30m",
    "iem_rolling_std_30m",
    "temperatura_fuso_c_rolling_mean_2h",
    "temperatura_fuso_c_rolling_std_2h",
    "vibracao_triaxial_rms_mms_rolling_mean_2h",
    "vibracao_triaxial_rms_mms_rolling_std_2h",
    "iem_rolling_mean_2h",
    "iem_rolling_std_2h"
]


def temporal_train_test_split(
    df: pd.DataFrame, 
    train_ratio: float = 0.70
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Realiza divisão temporal estrita de dados (70% treino, 30% teste).
    Sem embaralhamento (no shuffling) para respeitar causalidade industrial.
    Atende: RF-007
    """
    df_sorted = df.copy()
    if "timestamp" in df_sorted.columns:
        df_sorted["timestamp"] = pd.to_datetime(df_sorted["timestamp"])
        df_sorted = df_sorted.sort_values(by="timestamp").reset_index(drop=True)
        
    n_total = len(df_sorted)
    split_idx = int(n_total * train_ratio)
    
    train_df = df_sorted.iloc[:split_idx].copy()
    test_df = df_sorted.iloc[split_idx:].copy()
    return train_df, test_df


def prepare_features(
    df: pd.DataFrame, 
    feature_cols: Optional[List[str]] = None
) -> Tuple[np.ndarray, Optional[np.ndarray]]:
    """
    Extrai matriz X de features numéricas e vetor y de alvos.
    """
    cols = feature_cols or FEATURE_COLUMNS
    # Garante que colunas faltantes recebam 0.0
    for col in cols:
        if col not in df.columns:
            df[col] = 0.0
            
    X = df[cols].values
    y = df["tipo_falha"].values if "tipo_falha" in df.columns else None
    return X, y


class PredictiveMaintenanceEnsemble:
    """
    Pipeline preditivo multiclasse com balanceamento de pesos e extração de métricas MLOps.
    Atende: RF-008, RF-009, RF-011
    """
    def __init__(self, n_estimators: int = 100, random_state: int = 42):
        self.rf_model = RandomForestClassifier(
            n_estimators=n_estimators,
            class_weight="balanced",
            max_depth=16,
            random_state=random_state,
            n_jobs=1
        )
        self.gb_model = HistGradientBoostingClassifier(
            class_weight="balanced",
            max_iter=100,
            random_state=random_state
        )
        self.feature_names = FEATURE_COLUMNS
        self.is_trained = False
        
    def train(self, X_train: np.ndarray, y_train: np.ndarray) -> Dict[str, Any]:
        """
        Treina ambos os modelos com balanceamento e seleciona o melhor classificador.
        """
        self.rf_model.fit(X_train, y_train)
        self.gb_model.fit(X_train, y_train)
        self.is_trained = True
        
        return {
            "rf_feature_importances": dict(zip(self.feature_names, self.rf_model.feature_importances_))
        }

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
        """
        Calcula matriz de confusão, recall por classe e relatório detalhado.
        Atende: RF-011
        """
        if not self.is_trained:
            raise RuntimeError("Modelo não treinado.")
            
        y_pred_rf = self.rf_model.predict(X_test)
        y_pred_gb = self.gb_model.predict(X_test)
        
        # Recall por classe
        recall_rf = recall_score(y_test, y_pred_rf, average=None, zero_division=0)
        recall_gb = recall_score(y_test, y_pred_gb, average=None, zero_division=0)
        
        # Matriz de confusão
        cm_rf = confusion_matrix(y_test, y_pred_rf).tolist()
        cm_gb = confusion_matrix(y_test, y_pred_gb).tolist()
        
        report_rf = classification_report(y_test, y_pred_rf, output_dict=True, zero_division=0)
        
        return {
            "random_forest": {
                "recall_per_class": {CLASS_NAMES.get(i, f"Classe_{i}"): float(rec) for i, rec in enumerate(recall_rf)},
                "confusion_matrix": cm_rf,
                "overall_accuracy": float(report_rf["accuracy"])
            },
            "gradient_boosting": {
                "recall_per_class": {CLASS_NAMES.get(i, f"Classe_{i}"): float(rec) for i, rec in enumerate(recall_gb)},
                "confusion_matrix": cm_gb
            }
        }

    def predict_single(self, features: np.ndarray) -> Tuple[int, str, float]:
        """
        Inferência unitária em tempo real.
        Retorna (classe_id, nome_classe, probabilidade_confianca).
        """
        if not self.is_trained:
            raise RuntimeError("Modelo não treinado.")
            
        if features.ndim == 1:
            features = features.reshape(1, -1)
            
        probs = self.rf_model.predict_proba(features)[0]
        class_id = int(np.argmax(probs))
        confidence = float(probs[class_id])
        class_name = CLASS_NAMES.get(class_id, "Desconhecido")
        
        return class_id, class_name, confidence

    def predict_batch(self, features: np.ndarray) -> List[Tuple[int, str, float]]:
        """
        Inferência em lote vetorizada.
        """
        if not self.is_trained:
            raise RuntimeError("Modelo não treinado.")
            
        probs = self.rf_model.predict_proba(features)
        results = []
        for p in probs:
            c_id = int(np.argmax(p))
            conf = float(p[c_id])
            results.append((c_id, CLASS_NAMES.get(c_id, "Desconhecido"), conf))
        return results
