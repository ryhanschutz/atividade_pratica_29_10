# Atende: RF-012, RF-013, RNF-001, RNF-002
"""
Módulo de Visão Computacional aplicada a controle de qualidade em soldagem e usinagem.
Responsabilidades:
- Inspeção geométrica de cordão de solda: pipeline completo de OpenCV com exposição
  de cada etapa intermediária (original, nitidez, cinza, blur, bordas Canny,
  dilatação, segmentação de poros, overlay final com anotações).
- Análise termográfica da Zona Afetada pelo Calor (HAZ): conversão HSV, mascaramento
  por faixa de calor e mapeamento de temperatura estimada por pixel (via escala de cores).
- Estimativa de temperatura por pixel a partir de pseudocolor (mapa JET/TURBO).
"""

from typing import Dict, Any, Tuple, List
import numpy as np
import cv2


# ─────────────────────────────────────────────────────────────────────────────
# UTILITÁRIOS GERAIS
# ─────────────────────────────────────────────────────────────────────────────

def apply_sharpening_filter(image: np.ndarray) -> np.ndarray:
    """
    Aplica filtro de nitidez (unsharp mask 3x3) para realce de bordas metálicas.
    Etapa 1 do pipeline de inspeção de solda. Atende: RF-012
    """
    kernel = np.array([
        [0, -1,  0],
        [-1,  5, -1],
        [0, -1,  0]
    ], dtype=np.float32)
    return cv2.filter2D(image, -1, kernel)


def apply_morphology(binary: np.ndarray, op: str = "dilate", ksize: int = 3) -> np.ndarray:
    """Aplica operação morfológica em máscara binária."""
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (ksize, ksize))
    if op == "dilate":
        return cv2.dilate(binary, kernel, iterations=1)
    elif op == "erode":
        return cv2.erode(binary, kernel, iterations=1)
    elif op == "open":
        return cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
    else:  # close
        return cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)


def annotate_contours(image: np.ndarray, contours: list, color: Tuple = (0, 0, 255)) -> np.ndarray:
    """Desenha contornos detectados sobre cópia colorida da imagem."""
    annotated = image.copy() if len(image.shape) == 3 else cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
    cv2.drawContours(annotated, contours, -1, color, 2)
    return annotated


# ─────────────────────────────────────────────────────────────────────────────
# PIPELINE COMPLETO DE INSPEÇÃO DE SOLDA
# ─────────────────────────────────────────────────────────────────────────────

def inspect_weld_seam_full_pipeline(
    image: np.ndarray,
    canny_thresh1: int = 50,
    canny_thresh2: int = 150,
    min_pore_area: float = 3.0,
    max_pore_area: float = 5000.0,
    use_roi: bool = True,
    morph_ksize: int = 3
) -> Dict[str, Any]:
    """
    Pipeline completo de inspeção do cordão de solda robotizada com exposição
    de cada etapa intermediária para análise visual pelo operador.

    Retorna dict com:
      - etapas: dict[nome_etapa -> np.ndarray] para visualização step-by-step
      - metricas: resultados quantitativos
      - status_cordao: classificação final
      - contornos: lista de contornos detectados

    Etapas:
      1_original, 2_roi, 3_nitidez, 4_cinza, 5_blur,
      6_bordas_canny, 7_dilatacao, 8_mascara_poros, 9_overlay_final

    Atende: RF-012
    """
    if image is None or image.size == 0:
        raise ValueError("Imagem inválida ou vazia.")

    etapas: Dict[str, np.ndarray] = {}
    h, w = image.shape[:2]

    # Etapa 1: Original
    etapas["1_original"] = image.copy()

    # Etapa 2: ROI
    if use_roi and h >= 300 and w >= 300:
        roi_y1, roi_y2 = int(h * 0.44), int(h * 0.57)
        roi_x1, roi_x2 = int(w * 0.13), int(w * 0.85)
        target_img = image[roi_y1:roi_y2, roi_x1:roi_x2]
    else:
        target_img = image.copy()
    etapas["2_roi"] = target_img.copy()

    # Etapa 3: Nitidez
    sharpened = apply_sharpening_filter(target_img)
    etapas["3_nitidez"] = sharpened.copy()

    # Etapa 4: Tons de Cinza
    if len(sharpened.shape) == 3:
        gray = cv2.cvtColor(sharpened, cv2.COLOR_BGR2GRAY)
    else:
        gray = sharpened.copy()
    etapas["4_cinza"] = gray.copy()

    # Etapa 5: Blur Gaussiano
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    etapas["5_blur"] = blurred.copy()

    # Etapa 6: Bordas Canny
    edges = cv2.Canny(blurred, canny_thresh1, canny_thresh2)
    etapas["6_bordas_canny"] = edges.copy()

    # Etapa 7: Dilatação Morfológica
    dilated = apply_morphology(edges, op="dilate", ksize=morph_ksize)
    etapas["7_dilatacao"] = dilated.copy()

    # Etapa 8: Segmentação de Poros (Cavidades Escuras)
    cordon_area = float(target_img.shape[0] * target_img.shape[1])
    if len(target_img.shape) == 3:
        dark_mask = (
            (target_img[:, :, 0] < 35) &
            (target_img[:, :, 1] < 35) &
            (target_img[:, :, 2] < 35)
        ).astype(np.uint8) * 255
    else:
        _, dark_mask = cv2.threshold(gray, 35, 255, cv2.THRESH_BINARY_INV)
    dark_mask_closed = apply_morphology(dark_mask, op="close", ksize=3)
    etapas["8_mascara_poros"] = dark_mask_closed.copy()

    # Análise de contornos
    contours_edge, _ = cv2.findContours(dilated, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    valid_canny_cnts = [
        c for c in contours_edge
        if min_pore_area <= cv2.contourArea(c) <= min(max_pore_area, cordon_area * 0.15)
    ]
    contours_dark, _ = cv2.findContours(dark_mask_closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    pores_dark = [
        c for c in contours_dark
        if 20 <= cv2.contourArea(c) <= cordon_area * 0.15
    ]

    if len(pores_dark) > 0 and use_roi and h >= 300:
        selected_contours = pores_dark
    else:
        selected_contours = valid_canny_cnts

    total_pores = len(selected_contours)
    total_pore_area = sum(float(cv2.contourArea(c)) for c in selected_contours)
    porosity_percentage = (total_pore_area / cordon_area) * 100.0 if cordon_area > 0 else 0.0

    # Etapa 9: Overlay Final Anotado
    overlay = annotate_contours(target_img, selected_contours, color=(0, 0, 255))
    if porosity_percentage >= 4.0 or (total_pores >= 8 and porosity_percentage >= 0.8):
        status_text, cor_texto = "REPROVADO", (0, 0, 230)
    elif porosity_percentage >= 2.0:
        status_text, cor_texto = "ALERTA", (0, 165, 255)
    else:
        status_text, cor_texto = "APROVADO", (0, 200, 80)

    cv2.putText(overlay, f"STATUS: {status_text}", (8, 22),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, cor_texto, 2, cv2.LINE_AA)
    cv2.putText(overlay, f"Poros: {total_pores}  Porosidade: {porosity_percentage:.2f}%",
                (8, 44), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (220, 220, 220), 1, cv2.LINE_AA)
    etapas["9_overlay_final"] = overlay

    # Classificação final
    if porosity_percentage >= 4.0 or (total_pores >= 25 and total_pore_area >= 4000.0) or (
            total_pores >= 8 and porosity_percentage >= 0.8):
        status_cordao = "REPROVADO_POROSIDADE_EXCESSIVA"
    elif porosity_percentage >= 2.0 or (total_pores >= 25 and total_pore_area >= 2000.0):
        status_cordao = "ALERTA_POROSIDADE_ELEVADA"
    else:
        status_cordao = "APROVADO"

    metricas = {
        "status_cordao": status_cordao,
        "total_poros_detectados": int(total_pores),
        "area_total_poros_px": round(float(total_pore_area), 2),
        "taxa_porosidade_percentual": round(float(porosity_percentage), 4),
        "largura_imagem_px": int(w),
        "altura_imagem_px": int(h),
        "canny_thresh1": canny_thresh1,
        "canny_thresh2": canny_thresh2,
    }

    return {
        "etapas": etapas,
        "metricas": metricas,
        "status_cordao": status_cordao,
        "contornos": selected_contours,
    }


def inspect_weld_seam(
    image: np.ndarray,
    canny_thresh1: int = 50,
    canny_thresh2: int = 150,
    min_pore_area: float = 3.0,
    max_pore_area: float = 5000.0,
    use_roi: bool = True
) -> Dict[str, Any]:
    """Wrapper legado — retorna apenas as métricas. Atende: RF-012"""
    result = inspect_weld_seam_full_pipeline(
        image, canny_thresh1, canny_thresh2, min_pore_area, max_pore_area, use_roi
    )
    return result["metricas"]


# ─────────────────────────────────────────────────────────────────────────────
# ESTIMATIVA DE TEMPERATURA POR PIXEL
# ─────────────────────────────────────────────────────────────────────────────

_TEMP_MIN_C = 25.0     # Temperatura ambiente (pixel azul escuro no JET)
_TEMP_MAX_C = 1500.0   # Temperatura de fusão do aço (pixel branco/vermelho)


def pixel_temperature_map(
    image: np.ndarray,
    temp_min: float = _TEMP_MIN_C,
    temp_max: float = _TEMP_MAX_C,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Converte cada pixel de uma imagem pseudocolor termográfica em temperatura estimada (°C).

    Estratégia JET: Hue=120 (azul) -> frio, Hue=0 (vermelho) -> quente.
    Pixels brancos incandescentes (S baixo, V alto) recebem temperatura máxima.

    Retorna:
        mapa_temp_c: array float32 com temperatura por pixel (°C)
        mapa_visual: BGR colorido do mapa de temperatura
        heatmap_norm: normalizado [0,1]

    Atende: RF-013
    """
    if image is None or image.size == 0:
        raise ValueError("Imagem inválida para estimativa de temperatura.")

    if len(image.shape) == 2:
        image = cv2.applyColorMap(image, cv2.COLORMAP_JET)

    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV).astype(np.float32)
    h_channel = hsv[:, :, 0]
    s_channel = hsv[:, :, 1]
    v_channel = hsv[:, :, 2]

    # JET: H=0/180 vermelho (quente), H=120 azul (frio)
    hue_normalized = np.clip(1.0 - (h_channel / 120.0), 0.0, 1.0)

    # Pixels brancos incandescentes
    white_hot_mask = (s_channel < 30) & (v_channel > 220)
    hue_normalized[white_hot_mask] = 1.0

    mapa_temp_c = (hue_normalized * (temp_max - temp_min) + temp_min).astype(np.float32)

    temp_8bit = (hue_normalized * 255.0).clip(0, 255).astype(np.uint8)
    mapa_visual = cv2.applyColorMap(temp_8bit, cv2.COLORMAP_JET)

    return mapa_temp_c, mapa_visual, hue_normalized


def pixel_temperature_stats(mapa_temp_c: np.ndarray) -> Dict[str, Any]:
    """Calcula estatísticas de temperatura por pixel com histograma de distribuição."""
    flat = mapa_temp_c.flatten()
    hist, bin_edges = np.histogram(flat, bins=20)
    faixas = [
        {
            "faixa": f"{int(bin_edges[i])}–{int(bin_edges[i+1])}°C",
            "pixels": int(hist[i])
        }
        for i in range(len(hist))
    ]
    return {
        "temp_min_c": float(np.min(flat)),
        "temp_max_c": float(np.max(flat)),
        "temp_media_c": float(np.mean(flat)),
        "temp_desvio_c": float(np.std(flat)),
        "temp_mediana_c": float(np.median(flat)),
        "histograma": faixas,
    }


# ─────────────────────────────────────────────────────────────────────────────
# ANÁLISE TERMOGRÁFICA HAZ (PIPELINE COMPLETO)
# ─────────────────────────────────────────────────────────────────────────────

def analyze_haz_thermal_profile_full(
    thermal_image: np.ndarray,
    lower_hsv_critical: Tuple[int, int, int] = (0, 100, 140),
    upper_hsv_critical: Tuple[int, int, int] = (35, 255, 255),
    temp_min: float = _TEMP_MIN_C,
    temp_max: float = _TEMP_MAX_C,
) -> Dict[str, Any]:
    """
    Pipeline completo de análise termográfica HAZ com 8 etapas.

    Etapas:
      1_original, 2_hsv, 3_mascara_quente, 4_mascara_vermelha,
      5_mascara_branca, 6_mascara_combinada, 7_mapa_temperatura, 8_overlay_haz

    Atende: RF-013
    """
    if thermal_image is None or thermal_image.size == 0:
        raise ValueError("Imagem termográfica inválida.")

    etapas: Dict[str, np.ndarray] = {}

    if len(thermal_image.shape) == 2:
        thermal_image = cv2.applyColorMap(thermal_image, cv2.COLORMAP_JET)

    etapas["1_original"] = thermal_image.copy()

    hsv = cv2.cvtColor(thermal_image, cv2.COLOR_BGR2HSV)
    etapas["2_hsv"] = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

    mask_warm = cv2.inRange(hsv, np.array([10, 100, 150]), np.array([35, 255, 255]))
    etapas["3_mascara_quente"] = cv2.cvtColor(mask_warm, cv2.COLOR_GRAY2BGR)

    mask_red1 = cv2.inRange(hsv, np.array([0, 120, 140]), np.array([10, 255, 255]))
    mask_red2 = cv2.inRange(hsv, np.array([170, 120, 140]), np.array([180, 255, 255]))
    mask_red = cv2.bitwise_or(mask_red1, mask_red2)
    etapas["4_mascara_vermelha"] = cv2.cvtColor(mask_red, cv2.COLOR_GRAY2BGR)

    mask_white_hot = cv2.inRange(hsv, np.array([0, 0, 225]), np.array([180, 60, 255]))
    etapas["5_mascara_branca"] = cv2.cvtColor(mask_white_hot, cv2.COLOR_GRAY2BGR)

    combined_mask = cv2.bitwise_or(mask_warm, mask_red)
    combined_mask = cv2.bitwise_or(combined_mask, mask_white_hot)
    etapas["6_mascara_combinada"] = cv2.cvtColor(combined_mask, cv2.COLOR_GRAY2BGR)

    mapa_temp_c, mapa_visual, _ = pixel_temperature_map(thermal_image, temp_min, temp_max)
    etapas["7_mapa_temperatura"] = mapa_visual

    overlay = thermal_image.copy()
    overlay[combined_mask > 0] = [0, 0, 255]
    overlay = cv2.addWeighted(thermal_image, 0.6, overlay, 0.4, 0)
    etapas["8_overlay_haz"] = overlay

    critical_pixels = int(cv2.countNonZero(combined_mask))
    total_pixels = int(thermal_image.shape[0] * thermal_image.shape[1])
    critical_ratio = (critical_pixels / total_pixels) * 100.0 if total_pixels > 0 else 0.0

    if critical_ratio > 8.0:
        risco_termico = "CRITICO_SOBREAQUECIMENTO"
        recomendacao = "Interromper soldagem imediatamente. Risco de deformação estrutural e trinca."
    elif critical_ratio > 2.5:
        risco_termico = "ALERTA_TEMPERATURA_ALTA"
        recomendacao = "Aumentar tempo de resfriamento entre passes de solda."
    else:
        risco_termico = "NOMINAL_SEGURO"
        recomendacao = "Perfil térmico dentro dos parâmetros metalúrgicos."

    temp_stats = pixel_temperature_stats(mapa_temp_c)

    metricas = {
        "status_haz": risco_termico,
        "percentual_area_sobreaquecida": round(float(critical_ratio), 3),
        "pixels_criticos": critical_pixels,
        "diretriz_termica": recomendacao,
    }
    metricas.update({f"pixel_{k}": v for k, v in temp_stats.items() if k != "histograma"})

    return {
        "etapas": etapas,
        "metricas": metricas,
        "mapa_temp_c": mapa_temp_c,
        "temp_stats": temp_stats,
        "status_haz": risco_termico,
    }


def analyze_haz_thermal_profile(
    thermal_image: np.ndarray,
    lower_hsv_critical: Tuple[int, int, int] = (0, 100, 140),
    upper_hsv_critical: Tuple[int, int, int] = (35, 255, 255),
) -> Dict[str, Any]:
    """Wrapper legado — retorna apenas métricas. Atende: RF-013"""
    result = analyze_haz_thermal_profile_full(thermal_image, lower_hsv_critical, upper_hsv_critical)
    return result["metricas"]
