# Atende: RF-014, RF-015, RNF-001, RNF-002
"""
Módulo do motor de decisão industrial e atuação em malha fechada.
Responsabilidades:
- Mapeamento determinístico de diagnósticos preditos para ações operacionais do CLP:
  - MANTER_OPERACAO
  - REDUZIR_VELOCIDADE_50%
  - INTERROMPER_EMERGENCIA
- Lógica de segurança para envio de pulsos de comando a atuadores e máquinas CNC.
"""

from typing import Dict, Any


ACTION_MAINTAIN = "MANTER_OPERACAO"
ACTION_REDUCE = "REDUZIR_VELOCIDADE_50%"
ACTION_EMERGENCY_STOP = "INTERROMPER_EMERGENCIA"


DECISION_RULES = {
    0: {
        "acao": ACTION_MAINTAIN,
        "severidade": "BAIXA",
        "comando_clp": 0x01,  # Sinal operacional padrão
        "descricao": "Operação estável. Manter taxa de avanço e rotação nominais."
    },
    1: {
        "acao": ACTION_REDUCE,
        "severidade": "MEDIA",
        "comando_clp": 0x02,  # Override de feed rate para 50%
        "descricao": "Desgaste de ferramenta detectado. Reduzir avanço para evitar perda da peça."
    },
    2: {
        "acao": ACTION_EMERGENCY_STOP,
        "severidade": "ALTA",
        "comando_clp": 0x09,  # E-Stop por falha de refrigeração
        "descricao": "Falha no sistema de refrigeração. Interromper imediatamente para evitar choque térmico."
    },
    3: {
        "acao": ACTION_EMERGENCY_STOP,
        "severidade": "CRITICA",
        "comando_clp": 0xFF,  # E-Stop de travamento mecânico
        "descricao": "Desalinhamento/trinca estrutural em prensa/CNC. Parada de emergência imediata."
    }
}


def evaluate_industrial_action(
    predicted_class: int,
    confidence: float,
    min_confidence_threshold: float = 0.50
) -> Dict[str, Any]:
    """
    Determina a ação prescritiva em malha fechada baseada na classe e nível de confiança.
    Atende: RF-014, RF-015
    """
    rule = DECISION_RULES.get(predicted_class, {
        "acao": ACTION_REDUCE,
        "severidade": "INDEFINIDA",
        "comando_clp": 0x00,
        "descricao": "Estado não reconhecido. Operação em modo seguro preventivo."
    })

    # Caso a confiança preditiva seja muito baixa, ativa intervenção segura
    acao_final = rule["acao"]
    if confidence < min_confidence_threshold and predicted_class != 0:
        acao_final = ACTION_REDUCE

    return {
        "acao_recomendada": acao_final,
        "nivel_severidade": rule["severidade"],
        "codigo_clp_hex": hex(rule["comando_clp"]),
        "diretriz_operacional": rule["descricao"],
        "confianca_decisao": round(confidence, 4)
    }
