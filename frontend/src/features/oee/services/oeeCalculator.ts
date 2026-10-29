// src/features/oee/services/oeeCalculator.ts
import {
  StandardOeeInput,
  StandardOeeResult,
  PredictiveBaseline,
  PredictiveOeeResult,
} from "../types/oee";

/** Baselines nominais padrão da fábrica (conforme `src/core/calculadora_oee.py`) */
export const DEFAULT_PREDICTIVE_BASELINE: PredictiveBaseline = {
  availability: 0.95,
  performance: 0.92,
  quality: 0.98,
};

/**
 * Arredonda número para N casas decimais.
 */
export function roundTo(val: number, decimals: number = 4): number {
  const factor = Math.pow(10, decimals);
  return Math.round((val + Number.EPSILON) * factor) / factor;
}

/**
 * Calcula OEE padrão industrial (Nakajima / ISO 22400-2).
 * Trata com rigor valores de borda (zero planejado, zero produzido, etc).
 */
export function calculateStandardOee(input: StandardOeeInput): StandardOeeResult {
  const {
    tempoPlanejadoMin,
    tempoParadasNaoPlanejadasMin,
    tempoParadasPlanejadasMin = 0,
    quantidadeTotalProduzida,
    quantidadeAprovada,
    tempoCicloPadraoMinPorPeca,
    capacidadeNominalPeriodo,
  } = input;

  // 1. Tratamento de tempo planejado
  const tempoPlanejadoLiquido = Math.max(0, tempoPlanejadoMin - tempoParadasPlanejadasMin);

  let disponibilidade = 0;
  let tempoOperacionalMin = 0;

  if (tempoPlanejadoLiquido > 0) {
    tempoOperacionalMin = Math.max(0, tempoPlanejadoLiquido - tempoParadasNaoPlanejadasMin);
    disponibilidade = tempoOperacionalMin / tempoPlanejadoLiquido;
  }

  // Clampeamento de disponibilidade entre 0 e 1
  disponibilidade = Math.min(1, Math.max(0, disponibilidade));

  // 2. Cálculo de Performance
  let performance = 0;
  if (tempoOperacionalMin > 0) {
    if (tempoCicloPadraoMinPorPeca && tempoCicloPadraoMinPorPeca > 0) {
      const tempoOperacionalIdeal = quantidadeTotalProduzida * tempoCicloPadraoMinPorPeca;
      performance = tempoOperacionalIdeal / tempoOperacionalMin;
    } else if (capacidadeNominalPeriodo && capacidadeNominalPeriodo > 0) {
      // Proporção de produção em relação à capacidade nominal esperada
      performance = quantidadeTotalProduzida / capacidadeNominalPeriodo;
    } else {
      // Fallback sem ciclo padrão: se produziu com disponibilidade, assume 1.0 ou proporção
      performance = quantidadeTotalProduzida > 0 ? 1.0 : 0;
    }
  }

  performance = Math.min(1, Math.max(0, performance));

  // 3. Cálculo de Qualidade
  let qualidade = 0;
  if (quantidadeTotalProduzida > 0) {
    qualidade = Math.max(0, quantidadeAprovada) / quantidadeTotalProduzida;
  }

  qualidade = Math.min(1, Math.max(0, qualidade));

  // 4. OEE Composto
  const oee = disponibilidade * performance * qualidade;
  const quantidadeRefugada = Math.max(0, quantidadeTotalProduzida - quantidadeAprovada);
  const firstTimeYield = quantidadeTotalProduzida > 0
    ? (quantidadeAprovada / quantidadeTotalProduzida) * 100
    : 100;

  return {
    disponibilidade: roundTo(disponibilidade, 4),
    performance: roundTo(performance, 4),
    qualidade: roundTo(qualidade, 4),
    oee: roundTo(oee, 4),
    disponibilidadePercentual: `${(disponibilidade * 100).toFixed(1)}%`,
    performancePercentual: `${(performance * 100).toFixed(1)}%`,
    qualidadePercentual: `${(qualidade * 100).toFixed(1)}%`,
    oeePercentual: `${(oee * 100).toFixed(1)}%`,
    tempoOperacionalMin: roundTo(tempoOperacionalMin, 1),
    quantidadeRefugada,
    firstTimeYieldPercentual: `${firstTimeYield.toFixed(1)} %`,
  };
}

/**
 * Réplica exata em TypeScript da função Python `calculate_predictive_oee`
 * localizada em `src/core/calculadora_oee.py`.
 *
 * Mapeamento de Classes:
 * 0: Operação Normal
 * 1: Desgaste de Ferramenta / Fuso
 * 2: Falha de Refrigeração
 * 3: Desalinhamento / Trinca Mecânica
 */
export function calculatePredictiveOee(
  predictedClass: number,
  customBaseline?: Partial<PredictiveBaseline>
): PredictiveOeeResult {
  const baseA = customBaseline?.availability ?? DEFAULT_PREDICTIVE_BASELINE.availability;
  const baseP = customBaseline?.performance ?? DEFAULT_PREDICTIVE_BASELINE.performance;
  const baseQ = customBaseline?.quality ?? DEFAULT_PREDICTIVE_BASELINE.quality;

  let availability = baseA;
  let performance = baseP;
  let quality = baseQ;
  let penaltyReason = "Operação dentro dos parâmetros de projeto. Nenhuma penalidade aplicada.";

  if (predictedClass === 0) {
    // Normal: sem penalidade
  } else if (predictedClass === 1) {
    // Desgaste de Ferramenta / Fuso: penaliza Performance e leve perda de qualidade
    performance = baseP * 0.75;
    quality = baseQ * 0.92;
    penaltyReason = "Penalização de Performance devido à redução de avanço e desgaste da aresta cortante.";
  } else if (predictedClass === 2) {
    // Falha de Refrigeração: penaliza Qualidade severamente e Disponibilidade por parada
    quality = baseQ * 0.60;
    availability = baseA * 0.80;
    penaltyReason = "Penalização crítica de Qualidade por deformação térmica e Disponibilidade por parada.";
  } else if (predictedClass === 3) {
    // Desalinhamento / Trinca: penaliza Disponibilidade emergencial e Qualidade
    availability = baseA * 0.50;
    quality = baseQ * 0.70;
    penaltyReason = "Penalização severa de Disponibilidade por interrupção emergencial da prensa/CNC.";
  }

  const oeeScore = availability * performance * quality;

  return {
    disponibilidade: roundTo(availability, 4),
    performance: roundTo(performance, 4),
    qualidade: roundTo(quality, 4),
    oee_calculado: roundTo(oeeScore, 4),
    oee_percentual: `${(roundTo(oeeScore, 4) * 100).toFixed(2)}%`,
    justificativa_impacto: penaltyReason,
  };
}

