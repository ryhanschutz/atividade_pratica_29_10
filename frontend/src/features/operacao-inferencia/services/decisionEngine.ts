// src/features/operacao-inferencia/services/decisionEngine.ts

export const ACTION_MAINTAIN = "MANTER_OPERACAO";
export const ACTION_REDUCE = "REDUZIR_VELOCIDADE_50%";
export const ACTION_EMERGENCY_STOP = "PARADA_EMERGENCIAL";
export const ACTION_ALERT_OPERATOR = "ALERTA_OPERADOR_INSPECAO";

export interface DecisionResult {
  acao_recomendada: string;
  nivel_severidade: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
  codigo_clp_hex: string;
  diretriz_operacional: string;
}

/**
 * Réplica exata em TypeScript do motor de decisão industrial
 * localizado em `src/core/motor_decisao.py`.
 */
export function evaluateIndustrialAction(
  predictedClass: number,
  confidence: number,
  minConfidenceThreshold: number = 0.70
): DecisionResult {
  if (confidence < minConfidenceThreshold) {
    return {
      acao_recomendada: ACTION_ALERT_OPERATOR,
      nivel_severidade: "MEDIA",
      codigo_clp_hex: "0x4",
      diretriz_operacional:
        "Classificação com incerteza probabilística. Solicitar inspeção visual e validação do operador.",
    };
  }

  if (predictedClass === 0) {
    return {
      acao_recomendada: ACTION_MAINTAIN,
      nivel_severidade: "BAIXA",
      codigo_clp_hex: "0x1",
      diretriz_operacional: "Operação nominal em regime estável. Sem intervenção necessária.",
    };
  }

  if (predictedClass === 1) {
    return {
      acao_recomendada: ACTION_REDUCE,
      nivel_severidade: "MEDIA",
      codigo_clp_hex: "0x2",
      diretriz_operacional:
        "Desgaste de ferramenta detectado. Redução de 50% no avanço do fuso para preservação do ferramental até próximo setup.",
    };
  }

  if (predictedClass === 2) {
    return {
      acao_recomendada: ACTION_EMERGENCY_STOP,
      nivel_severidade: "CRITICA",
      codigo_clp_hex: "0x9",
      diretriz_operacional:
        "Falha crítica no sistema de refrigeração. Interrupção imediata da usinagem para evitar queima de peça e empenamento térmico.",
    };
  }

  if (predictedClass === 3) {
    return {
      acao_recomendada: ACTION_EMERGENCY_STOP,
      nivel_severidade: "CRITICA",
      codigo_clp_hex: "0xff",
      diretriz_operacional:
        "Risco iminente de colisão, quebra de ferramenta ou trinca mecânica no cabeçote. Desarme imediato do relé de emergência do CLP.",
    };
  }

  return {
    acao_recomendada: ACTION_ALERT_OPERATOR,
    nivel_severidade: "ALTA",
    codigo_clp_hex: "0x0",
    diretriz_operacional: "Código de anomalia não reconhecido. Contatar engenharia de manutenção.",
  };
}

export interface TelemetryValues {
  temp: number;
  vib: number;
  torque: number;
  vazao: number;
  corrente: number;
  pressao: number;
  ruido: number;
}

/**
 * Avaliação preditiva baseada nas leituras físicas dos sensores.
 */
export function inferFailureFromTelemetry(t: TelemetryValues): {
  classId: number;
  className: string;
  confidence: number;
} {
  // Trinca / Desalinhamento: Vibração alta e Ruído alto
  if (t.vib > 6.0 || (t.vib > 4.5 && t.ruido > 80.0)) {
    return {
      classId: 3,
      className: "Desalinhamento / Trinca Mecânica",
      confidence: 0.94,
    };
  }

  // Falha de Refrigeração: Temperatura elevada e Vazão reduzida
  if (t.temp > 85.0 && t.vazao < 15.0) {
    return {
      classId: 2,
      className: "Falha de Refrigeração",
      confidence: 0.92,
    };
  }

  // Desgaste de Ferramenta: Torque e Corrente elevados com leve vibração
  if (t.torque > 180.0 || (t.corrente > 45.0 && t.temp > 70.0)) {
    return {
      classId: 1,
      className: "Desgaste de Ferramenta",
      confidence: 0.88,
    };
  }

  // Normal
  return {
    classId: 0,
    className: "Operação Normal",
    confidence: 0.96,
  };
}

