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
import base64
from src.core.visao_computacional import (
    inspect_weld_seam,
    analyze_haz_thermal_profile,
    inspect_weld_seam_full_pipeline,
    analyze_haz_thermal_profile_full
)
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
    Inspeção óptica de cordão de solda usando nitidez, Canny, contornos e extração de pontos.
    Atende: RF-012
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Formato de imagem inválido.")
        
    full_result = inspect_weld_seam_full_pipeline(image)
    metricas = full_result["metricas"]
    cnts = full_result["contornos"]
    h, w = image.shape[:2]
    roi_y1, roi_x1 = int(h * 0.44), int(w * 0.13)
    
    pontos_defeito = []
    for i, c in enumerate(cnts):
        M = cv2.moments(c)
        cx = int(M['m10'] / M['m00']) if M['m00'] > 0 else 0
        cy = int(M['m01'] / M['m00']) if M['m00'] > 0 else 0
        area = float(cv2.contourArea(c))
        bx, by, bw, bh = cv2.boundingRect(c)
        perim = float(cv2.arcLength(c, True))
        circ = float(4 * np.pi * area / (perim * perim)) if perim > 0 else 0.0
        diam = float(2.0 * np.sqrt(area / np.pi)) if area > 0 else 0.0
        
        sev = 'CRITICO' if area >= 50 else ('ALERTA' if area >= 20 else 'TOLERAVEL')
        aws = 'Reprovado AWS D1.1 - Poro Excessivo' if sev == 'CRITICO' else ('Alerta AWS D1.1 - Poro Agrupado' if sev == 'ALERTA' else 'Tolerável AWS D1.1 - Microcavidade')
        acao = 'Esmerilhamento profundo e ressoldagem' if sev == 'CRITICO' else ('Monitorar evolução no próximo passe' if sev == 'ALERTA' else 'Liberado sem intervenção')
        
        pontos_defeito.append({
            'id': f'P-{i+1:02d}',
            'x': int(cx),
            'y': int(cy),
            'x_global': int(roi_x1 + cx),
            'y_global': int(roi_y1 + cy),
            'largura_px': int(bw),
            'altura_px': int(bh),
            'area_px': round(area, 1),
            'diametro_px': round(diam, 2),
            'circularidade': round(circ, 2),
            'severidade': sev,
            'classificacao_aws': aws,
            'acao_recomendada': acao
        })

    # Encode steps to base64
    etapas_b64 = {}
    for step_name, step_img in full_result.get("etapas", {}).items():
        _, enc = cv2.imencode(".png", step_img)
        etapas_b64[step_name] = f"data:image/png;base64,{base64.b64encode(enc).decode('utf-8')}"

    return WeldInspectionResponse(
        status_cordao=metricas["status_cordao"],
        total_poros_detectados=metricas["total_poros_detectados"],
        area_total_poros_px=metricas["area_total_poros_px"],
        taxa_porosidade_percentual=metricas["taxa_porosidade_percentual"],
        largura_imagem_px=metricas["largura_imagem_px"],
        altura_imagem_px=metricas["altura_imagem_px"],
        pontos_defeito=pontos_defeito,
        etapas_base64=etapas_b64
    )


@router.post("/vision/analyze-haz", response_model=HAZAnalysisResponse, tags=["Visão Computacional"])
async def api_analyze_haz(file: UploadFile = File(...)):
    """
    Análise termográfica da Zona Afetada pelo Calor (HAZ) com espaço HSV e detecção de pontos quentes.
    Atende: RF-013
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Formato de imagem termográfica inválido.")
        
    full_result = analyze_haz_thermal_profile_full(image)
    metricas = full_result["metricas"]
    mapa = full_result["mapa_temp_c"]

    crit_mask = (mapa >= 800.0).astype(np.uint8) * 255
    cnts, _ = cv2.findContours(crit_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = sorted(cnts, key=lambda c: cv2.contourArea(c), reverse=True)
    
    pontos_quentes = []
    for i, c in enumerate(cnts[:20]):
        area = cv2.contourArea(c)
        if area < 4:
            continue
        M = cv2.moments(c)
        cx = int(M['m10']/M['m00']) if M['m00']>0 else 0
        cy = int(M['m01']/M['m00']) if M['m00']>0 else 0
        if cx == 0 and cy == 0:
            continue
        temp_val = float(mapa[cy, cx])
        zona = 'Zona de Fusão (Poça)' if temp_val >= 1200 else ('Zona Térmica Crítica (HAZ)' if temp_val >= 900 else 'Zona de Transição')
        sev = 'CRITICO' if temp_val >= 1200 else ('ALERTA' if temp_val >= 900 else 'NOMINAL')
        pontos_quentes.append({
            'id': f'TH-{len(pontos_quentes)+1:02d}',
            'x': int(cx),
            'y': int(cy),
            'temperatura_c': round(temp_val, 1),
            'area_px': round(float(area), 1),
            'zona_haz': zona,
            'severidade': sev
        })

    etapas_b64 = {}
    for step_name, step_img in full_result.get("etapas", {}).items():
        _, enc = cv2.imencode(".png", step_img)
        etapas_b64[step_name] = f"data:image/png;base64,{base64.b64encode(enc).decode('utf-8')}"

    return HAZAnalysisResponse(
        status_haz=metricas["status_haz"],
        percentual_area_sobreaquecida=metricas["percentual_area_sobreaquecida"],
        pixels_criticos=metricas["pixels_criticos"],
        diretriz_termica=metricas["diretriz_termica"],
        pixel_temp_min_c=metricas.get("pixel_temp_min_c", 25.0),
        pixel_temp_max_c=metricas.get("pixel_temp_max_c", 1500.0),
        pixel_temp_media_c=metricas.get("pixel_temp_media_c", 350.0),
        pontos_quentes=pontos_quentes,
        etapas_base64=etapas_b64
    )
