# Atende: RF-010, RNF-001, RNF-002
"""
Módulo de cálculo preditivo do impacto de falhas no OEE (Overall Equipment Effectiveness).
Responsabilidades:
- Estimar o impacto do estado operacional predito nos pilares:
  - Disponibilidade (Availability) -> penalizada em risco de parada iminente.
  - Performance -> penalizada em desgaste de ferramenta e perda de avanço.
  - Qualidade (Quality) -> penalizada em desvios de processo, refrigeração e trincas.
- Cálculo do OEE Global: OEE = Disponibilidade * Performance * Qualidade.
"""

from typing import Dict, Any


# Baselines nominais da fábrica em regime normal
BASELINE_AVAILABILITY = 0.95
BASELINE_PERFORMANCE = 0.92
BASELINE_QUALITY = 0.98


def calculate_predictive_oee(
    predicted_class: int,
    custom_baseline: Dict[str, float] = None
) -> Dict[str, Any]:
    """
    Calcula os três pilares do OEE e o valor composto penalizando conforme a falha predita.
    Atende: RF-010
    """
    base_a = custom_baseline.get("availability", BASELINE_AVAILABILITY) if custom_baseline else BASELINE_AVAILABILITY
    base_p = custom_baseline.get("performance", BASELINE_PERFORMANCE) if custom_baseline else BASELINE_PERFORMANCE
    base_q = custom_baseline.get("quality", BASELINE_QUALITY) if custom_baseline else BASELINE_QUALITY

    availability = base_a
    performance = base_p
    quality = base_q
    penalty_reason = "Operação dentro dos parâmetros de projeto. Nenhuma penalidade aplicada."

    if predicted_class == 0:
        # Normal
        pass
    elif predicted_class == 1:
        # Desgaste de Ferramenta / Fuso: penaliza Performance (redução forçada de avanço para não danificar peça)
        performance = base_p * 0.75  # ~69%
        quality = base_q * 0.92     # leve perda superficial
        penalty_reason = "Penalização de Performance devido à redução de avanço e desgaste da aresta cortante."
    elif predicted_class == 2:
        # Falha de Refrigeração: penaliza Qualidade severamente (trinca térmica/dilatação) e Disponibilidade
        quality = base_q * 0.60      # refugo imediato por superaquecimento
        availability = base_a * 0.80 # parada para purga e recarga do fluido
        penalty_reason = "Penalização crítica de Qualidade por deformação térmica e Disponibilidade por parada."
    elif predicted_class == 3:
        # Desalinhamento / Trinca: penaliza Disponibilidade (parada emergencial imediata para não quebrar molde)
        availability = base_a * 0.50 # parada forçada de manutenção corretiva
        quality = base_q * 0.70      # desvio dimensional grave
        penalty_reason = "Penalização severa de Disponibilidade por interrupção emergencial da prensa/CNC."

    oee_score = availability * performance * quality

    return {
        "disponibilidade": round(float(availability), 4),
        "performance": round(float(performance), 4),
        "qualidade": round(float(quality), 4),
        "oee_calculado": round(float(oee_score), 4),
        "oee_percentual": f"{round(oee_score * 100, 2)}%",
        "justificativa_impacto": penalty_reason
    }
