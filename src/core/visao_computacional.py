# Atende: RF-012, RF-013, RNF-001, RNF-002
"""
Módulo de Visão Computacional aplicada a controle de qualidade em soldagem e usinagem.
Responsabilidades:
- Inspeção geométrica de cordão de solda: filtro de nitidez, conversão para tons de cinza,
  algoritmo Canny Edge Detection e análise de contornos para medir porosidade e descontinuidades.
- Análise termográfica da Zona Afetada pelo Calor (HAZ - Heat-Affected Zone):
  conversão para espaço de cor HSV e limiarização (thresholding) para isolar sobreaquecimento.
"""

from typing import Dict, Any, Tuple, Optional
import numpy as np
import cv2


def apply_sharpening_filter(image: np.ndarray) -> np.ndarray:
    """
    Aplica filtro de nitidez espacial (kernel convolucional de realce) na imagem.
    Atende: RF-012
    """
    # Kernel de realce de bordas / unsharp mask
    kernel = np.array([
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
    ], dtype=np.float32)
    return cv2.filter2D(image, -1, kernel)


def inspect_weld_seam(
    image: np.ndarray,
    canny_thresh1: int = 50,
    canny_thresh2: int = 150,
    min_pore_area: float = 3.0,
    max_pore_area: float = 5000.0,
    use_roi: bool = True
) -> Dict[str, Any]:
    """
    Inspeciona cordão de solda robotizada:
    1. Extração de ROI do cordão de solda (área central de fusão)
    2. Realce de nitidez
    3. Conversão para escala de cinza
    4. Canny Edge Detection e limiarização de descontinuidade
    5. Análise de contornos para detecção de porosidades e trincas
    Atende: RF-012
    """
    if image is None or image.size == 0:
        raise ValueError("Imagem inválida ou vazia.")

    h, w = image.shape[:2]

    # Recorte da Região de Interesse (ROI) do cordão se a imagem for composta
    if use_roi and h >= 300 and w >= 300:
        roi_y1, roi_y2 = int(h * 0.35), int(h * 0.68)
        roi_x1, roi_x2 = int(w * 0.08), int(w * 0.92)
        target_img = image[roi_y1:roi_y2, roi_x1:roi_x2]
    else:
        target_img = image

    # 1. Filtro de nitidez
    sharpened = apply_sharpening_filter(target_img)

    # 2. Conversão para escala de cinza
    if len(sharpened.shape) == 3:
        gray = cv2.cvtColor(sharpened, cv2.COLOR_BGR2GRAY)
    else:
        gray = sharpened

    # 3. Suavização leve para atenuar ruído de textura metálica
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # 4. Detecção de bordas via Canny
    edges = cv2.Canny(blurred, canny_thresh1, canny_thresh2)

    # 5. Detecção de depressões escuras / porosidades no cordão
    # Poros em cordões de solda geram cavidades escuras de baixa refletância
    _, dark_pores_mask = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY_INV)
    combined_defect_mask = cv2.bitwise_or(edges, dark_pores_mask)

    # 6. Encontra contornos de poros e descontinuidades
    contours, _ = cv2.findContours(combined_defect_mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    total_pores = 0
    total_pore_area = 0.0
    cordon_area = float(gray.shape[0] * gray.shape[1])

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if min_pore_area <= area <= max_pore_area:
            total_pores += 1
            total_pore_area += area

    porosity_percentage = (total_pore_area / cordon_area) * 100.0 if cordon_area > 0 else 0.0

    # Critério de classificação metalúrgica (AWS D1.1 / ISO 5817)
    if total_pores > 45 or porosity_percentage > 4.0:
        status_aprovacao = "REPROVADO_POROSIDADE_EXCESSIVA"
    elif total_pores > 20 or porosity_percentage > 2.0:
        status_aprovacao = "ALERTA_POROSIDADE_ELEVADA"
    else:
        status_aprovacao = "APROVADO"

    return {
        "status_cordao": status_aprovacao,
        "total_poros_detectados": int(total_pores),
        "area_total_poros_px": round(float(total_pore_area), 2),
        "taxa_porosidade_percentual": round(float(porosity_percentage), 4),
        "largura_imagem_px": int(w),
        "altura_imagem_px": int(h)
    }


def analyze_haz_thermal_profile(
    thermal_image: np.ndarray,
    lower_hsv_critical: Tuple[int, int, int] = (0, 100, 140),
    upper_hsv_critical: Tuple[int, int, int] = (35, 255, 255)
) -> Dict[str, Any]:
    """
    Análise termográfica da Zona Afetada pelo Calor (HAZ - Heat-Affected Zone):
    1. Converte imagem para espaço HSV
    2. Aplica limiarização (thresholding) isolando zonas de calor extremo (> 700°C)
       e gradiente térmico crítico (vermelho, amarelo e branco de incandescência)
    3. Calcula densidade da zona superaquecida e risco metalúrgico
    Atende: RF-013
    """
    if thermal_image is None or thermal_image.size == 0:
        raise ValueError("Imagem termográfica inválida.")

    if len(thermal_image.shape) == 2:
        thermal_image = cv2.applyColorMap(thermal_image, cv2.COLORMAP_JET)

    # 1. Conversão para espaço HSV
    hsv = cv2.cvtColor(thermal_image, cv2.COLOR_BGR2HSV)

    # 2. Máscara para faixa amarela/alaranjada incandescente (H: 10 a 35)
    mask_warm = cv2.inRange(hsv, np.array([10, 100, 150]), np.array([35, 255, 255]))
    
    # 3. Máscara para o vermelho extremo (H: 0 a 10 e 170 a 180)
    mask_red1 = cv2.inRange(hsv, np.array([0, 120, 140]), np.array([10, 255, 255]))
    mask_red2 = cv2.inRange(hsv, np.array([170, 120, 140]), np.array([180, 255, 255]))
    
    # 4. Máscara para ponto branco de fusão / calor extremo central (S baixo, V alto)
    mask_white_hot = cv2.inRange(hsv, np.array([0, 0, 225]), np.array([180, 60, 255]))

    # Combinação das zonas térmicas de alta energia
    combined_mask = cv2.bitwise_or(mask_warm, mask_red1)
    combined_mask = cv2.bitwise_or(combined_mask, mask_red2)
    combined_mask = cv2.bitwise_or(combined_mask, mask_white_hot)

    # 5. Quantificação de área crítica
    critical_pixels = int(cv2.countNonZero(combined_mask))
    total_pixels = int(thermal_image.shape[0] * thermal_image.shape[1])
    critical_ratio = (critical_pixels / total_pixels) * 100.0 if total_pixels > 0 else 0.0

    # Diagnóstico da Zona Afetada
    if critical_ratio > 8.0:
        risco_termico = "CRITICO_SOBREAQUECIMENTO"
        recomendacao = "Interromper soldagem imediatamente. Risco de deformação estrutural e trinca."
    elif critical_ratio > 2.5:
        risco_termico = "ALERTA_TEMPERATURA_ALTA"
        recomendacao = "Aumentar tempo de resfriamento entre passes de solda."
    else:
        risco_termico = "NOMINAL_SEGURO"
        recomendacao = "Perfil térmico dentro dos parâmetros metalúrgicos."

    return {
        "status_haz": risco_termico,
        "percentual_area_sobreaquecida": round(float(critical_ratio), 3),
        "pixels_criticos": critical_pixels,
        "diretriz_termica": recomendacao
    }
