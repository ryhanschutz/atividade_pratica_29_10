// src/features/oee/types/oee.ts

/**
 * Entradas para cálculo do OEE Clássico / Padrão (Nakajima / ISO 22400-2).
 */
export interface StandardOeeInput {
  /** Tempo total planejado para produção (em minutos) */
  tempoPlanejadoMin: number;
  /** Tempo total de paradas não planejadas (em minutos) */
  tempoParadasNaoPlanejadasMin: number;
  /** Tempo total de paradas planejadas (em minutos, ex: setup, almoço) */
  tempoParadasPlanejadasMin?: number;
  /** Quantidade total de peças produzidas (boas + refugo) */
  quantidadeTotalProduzida: number;
  /** Quantidade de peças aprovadas (boas / primeira viagem) */
  quantidadeAprovada: number;
  /** Tempo padrão de ciclo ideal por peça (em minutos por peça) */
  tempoCicloPadraoMinPorPeca?: number;
  /** Capacidade / Meta nominal de produção para o período */
  capacidadeNominalPeriodo?: number;
}

/**
 * Resultado completo do OEE com os três pilares e diagnósticos.
 */
export interface StandardOeeResult {
  /** Disponibilidade (0.0 a 1.0) */
  disponibilidade: number;
  /** Performance (0.0 a 1.0) */
  performance: number;
  /** Qualidade (0.0 a 1.0) */
  qualidade: number;
  /** OEE Global Composto (0.0 a 1.0) = D × P × Q */
  oee: number;
  /** Percentuais formatados para exibição (ex: "85.8%") */
  disponibilidadePercentual: string;
  performancePercentual: string;
  qualidadePercentual: string;
  oeePercentual: string;
  /** Tempo operacional líquido (em minutos) */
  tempoOperacionalMin: number;
  /** Quantidade de peças rejeitadas */
  quantidadeRefugada: number;
  /** Rendimento de primeira vez (First Time Yield) */
  firstTimeYieldPercentual: string;
}

/**
 * Baselines nominais da fábrica para OEE Preditivo.
 */
export interface PredictiveBaseline {
  availability: number;
  performance: number;
  quality: number;
}

/**
 * Resultado do OEE Preditivo correspondente a `src/core/calculadora_oee.py`.
 */
export interface PredictiveOeeResult {
  disponibilidade: number;
  performance: number;
  qualidade: number;
  oee_calculado: number;
  oee_percentual: string;
  justificativa_impacto: string;
}

/**
 * Histórico temporal diário de OEE.
 */
export interface DailyOeePoint {
  data: string;
  oee: number;
  disponibilidade: number;
  performance: number;
  qualidade: number;
  produzido: number;
  rejeitado: number;
  operadoresDisponiveis: number;
}

