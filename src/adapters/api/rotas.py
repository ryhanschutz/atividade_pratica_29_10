# Atende: RF-012, RF-013, RF-014, RF-015, RF-016, RNF-001, RNF-003, RNF-004
"""
Rotas da API FastAPI para monitoramento em malha fechada e visão computacional.
Responsabilidades:
- Endpoint POST /predict: diagnóstico e prescrição em tempo real.
- Endpoint POST /predict-batch: inferência em lote.
- Endpoint GET /health: checagem de saúde e consumo do nó Edge.
- Endpoints POST /vision/inspect-weld e POST /vision/analyze-haz: inspeção óptica industrial.
"""

import time
import os
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
import cv2
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends

from src.adapters.api.esquemas import (
    SensorTelemetryInput,
    BatchTelemetryInput,
    PredictionResponse,
    BatchPredictionResponse,
    SystemHealthResponse,
    OEEResponse,
    WeldInspectionResponse,
    HAZAnalysisResponse
)
from src.core.motor_decisao import evaluate_industrial_action
from src.core.calculadora_oee import calculate_predictive_oee
from src.core.engenharia_features import compute_mechanical_effort_index
from src.core.visao_computacional import inspect_weld_seam, analyze_haz_thermal_profile
from src.config.configuracoes import settings


router = APIRouter()
START_TIME = time.time()


def get_model_context():
    """Dependência para injeção do modelo preditivo carregado."""
    from src.main import MODEL_PIPELINE
    if MODEL_PIPELINE is None or not MODEL_PIPELINE.get("model"):
        raise HTTPException(status_code=503, detail="Modelo preditivo não carregado no nó Edge.")
    return MODEL_PIPELINE


def _build_feature_vector(item: SensorTelemetryInput, historical_means: Dict[str, Dict[str, float]]) -> np.ndarray:
    """Constrói o vetor de 25 features a partir do item e médias da liga."""
    # IEM
    iem = (item.torque_fuso_nm * item.vibracao_triaxial_rms_mms) / (max(item.vazao_refrigerante_lmin, 0.0) + 1.0)
    
    # Médias da liga
    liga_m = historical_means.get(item.liga_metalica, {})
    mean_temp = liga_m.get("temperatura_fuso_c", 50.0) or 50.0
    mean_vib = liga_m.get("vibracao_triaxial_rms_mms", 2.0) or 2.0
    mean_trq = liga_m.get("torque_fuso_nm", 120.0) or 120.0
    mean_cor = liga_m.get("corrente_estator_amp", 30.0) or 30.0
    mean_noi = liga_m.get("nivel_ruido_db", 65.0) or 65.0

    features = [
        item.temperatura_fuso_c,
        item.vibracao_triaxial_rms_mms,
        item.torque_fuso_nm,
        item.vazao_refrigerante_lmin,
        item.corrente_estator_amp,
        item.pressao_hidraulica_bar,
        item.nivel_ruido_db,
        iem,
        item.temperatura_fuso_c / mean_temp,
        item.vibracao_triaxial_rms_mms / mean_vib,
        item.torque_fuso_nm / mean_trq,
        item.corrente_estator_amp / mean_cor,
        item.nivel_ruido_db / mean_noi,
        # Aproximações de janela móvel para inferência online
        item.temperatura_fuso_c,  # rolling_mean_30m
        0.5,                      # rolling_std_30m
        item.vibracao_triaxial_rms_mms, # rolling_mean_30m
        0.2,                      # rolling_std_30m
        iem,                      # iem_rolling_mean_30m
        0.5,                      # iem_rolling_std_30m
        item.temperatura_fuso_c,  # rolling_mean_2h
        0.8,                      # rolling_std_2h
        item.vibracao_triaxial_rms_mms, # rolling_mean_2h
        0.3,                      # rolling_std_2h
        iem,                      # iem_rolling_mean_2h
        0.8                       # iem_rolling_std_2h
    ]
    return np.array(features, dtype=np.float32)


@router.get("/health", response_model=SystemHealthResponse, tags=["Monitoramento"])
async def get_health():
    """
    Checagem de integridade, consumo de memória e saúde operacional do nó Edge.
    Atende: RF-016, RNF-001
    """
    import os
    import psutil
    uptime = time.time() - START_TIME
    
    process = psutil.Process(os.getpid())
    ram_mb = process.memory_info().rss / (1024 * 1024)
    cpu_pct = process.cpu_percent(interval=None)

    from src.main import MODEL_PIPELINE
    has_model = MODEL_PIPELINE is not None and MODEL_PIPELINE.get("model") is not None

    return SystemHealthResponse(
        status="healthy",
        versao=settings.API_VERSION,
        uptime_segundos=round(uptime, 2),
        memoria_ram_mb=round(ram_mb, 2),
        cpu_percentual=round(cpu_pct, 2),
        modelo_carregado=has_model
    )


@router.post("/predict", response_model=PredictionResponse, tags=["Inferência em Malha Fechada"])
async def predict_single(item: SensorTelemetryInput, ctx: Dict[str, Any] = Depends(get_model_context)):
    """
    Inferência em tempo real: recebe telemetria e retorna diagnóstico,
    confiança, ação para CLP e impacto previsto no OEE.
    Atende: RF-010, RF-014
    """
    model = ctx["model"]
    historical_means = ctx.get("historical_means", {})
    
    feature_vector = _build_feature_vector(item, historical_means)
    class_id, class_name, confidence = model.predict_single(feature_vector)
    
    # Motor de decisão industrial
    decision = evaluate_industrial_action(class_id, confidence, settings.MIN_CONFIDENCE_THRESHOLD)
    
    # Impacto no OEE
    oee_data = calculate_predictive_oee(class_id)
    
    return PredictionResponse(
        id_celula=item.id_celula,
        liga_metalica=item.liga_metalica,
        codigo_falha=class_id,
        diagnostico=class_name,
        probabilidade_confianca=round(confidence, 4),
        acao_industrial_recomendada=decision["acao_recomendada"],
        severidade=decision["nivel_severidade"],
        comando_clp_hex=decision["codigo_clp_hex"],
        diretriz_operacional=decision["diretriz_operacional"],
        impacto_oee=OEEResponse(**oee_data)
    )


@router.post("/predict-batch", response_model=BatchPredictionResponse, tags=["Inferência em Malha Fechada"])
async def predict_batch(payload: BatchTelemetryInput, ctx: Dict[str, Any] = Depends(get_model_context)):
    """
    Inferência vetorizada em lote para múltiplos sensores/máquinas simultâneas.
    Atende: RF-015
    """
    model = ctx["model"]
    historical_means = ctx.get("historical_means", {})
    
    if not payload.items:
        return BatchPredictionResponse(total_processado=0, predicoes=[])
        
    feature_list = [_build_feature_vector(item, historical_means) for item in payload.items]
    X_batch = np.array(feature_list)
    
    batch_results = model.predict_batch(X_batch)
    responses = []
    
    for item, (class_id, class_name, confidence) in zip(payload.items, batch_results):
        decision = evaluate_industrial_action(class_id, confidence, settings.MIN_CONFIDENCE_THRESHOLD)
        oee_data = calculate_predictive_oee(class_id)
        responses.append(PredictionResponse(
            id_celula=item.id_celula,
            liga_metalica=item.liga_metalica,
            codigo_falha=class_id,
            diagnostico=class_name,
            probabilidade_confianca=round(confidence, 4),
            acao_industrial_recomendada=decision["acao_recomendada"],
            severidade=decision["nivel_severidade"],
            comando_clp_hex=decision["codigo_clp_hex"],
            diretriz_operacional=decision["diretriz_operacional"],
            impacto_oee=OEEResponse(**oee_data)
        ))
        
    return BatchPredictionResponse(
        total_processado=len(responses),
        predicoes=responses
    )


@router.post("/vision/inspect-weld", response_model=WeldInspectionResponse, tags=["Visão Computacional"])
async def api_inspect_weld(file: UploadFile = File(...)):
    """
    Inspeção óptica de cordão de solda usando nitidez, Canny e contornos.
    Atende: RF-012
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Formato de imagem inválido.")
        
    result = inspect_weld_seam(image)
    return WeldInspectionResponse(**result)


@router.post("/vision/analyze-haz", response_model=HAZAnalysisResponse, tags=["Visão Computacional"])
async def api_analyze_haz(file: UploadFile = File(...)):
    """
    Análise termográfica da Zona Afetada pelo Calor (HAZ) com espaço HSV.
    Atende: RF-013
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Formato de imagem termográfica inválido.")
        
    result = analyze_haz_thermal_profile(image)
    return HAZAnalysisResponse(**result)
