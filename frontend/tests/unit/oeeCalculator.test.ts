// tests/unit/oeeCalculator.test.ts
import { describe, it, expect } from "vitest";
import {
  calculateStandardOee,
  calculatePredictiveOee,
  DEFAULT_PREDICTIVE_BASELINE,
} from "../../src/features/oee/services/oeeCalculator";

describe("Cálculo de OEE Padrão (Nakajima / ISO 22400-2)", () => {
  it("deve calcular Disponibilidade, Performance, Qualidade e OEE com precisão para caso nominal da Schutz Factory", () => {
    // Caso com base nos dados do dashboard de referência:
    // Disponibilidade: 85.8%, Performance: 80.5%, Qualidade: 93.6%
    // 0.858 * 0.805 * 0.936 = 0.64648 (~64.6%)
    const res = calculateStandardOee({
      tempoPlanejadoMin: 480, // 8h
      tempoParadasNaoPlanejadasMin: 68.16, // 480 * (1 - 0.858)
      tempoParadasPlanejadasMin: 0,
      quantidadeTotalProduzida: 14997,
      quantidadeAprovada: 14179,
      capacidadeNominalPeriodo: 18629.8, // 14997 / 0.805
    });

    expect(res.disponibilidade).toBeCloseTo(0.858, 2);
    expect(res.performance).toBeCloseTo(0.805, 2);
    expect(res.qualidade).toBeCloseTo(0.945, 2); // 14179 / 14997 = 94.54%
    expect(res.quantidadeRefugada).toBe(818); // 14997 - 14179 = 818
    expect(res.firstTimeYieldPercentual).toBe("94.5 %");
  });

  it("deve tratar caso de borda: Produção Zero (zero total e zero aprovadas)", () => {
    const res = calculateStandardOee({
      tempoPlanejadoMin: 480,
      tempoParadasNaoPlanejadasMin: 0,
      quantidadeTotalProduzida: 0,
      quantidadeAprovada: 0,
      capacidadeNominalPeriodo: 1000,
    });

    expect(res.disponibilidade).toBe(1);
    expect(res.performance).toBe(0);
    expect(res.qualidade).toBe(0);
    expect(res.oee).toBe(0);
    expect(res.quantidadeRefugada).toBe(0);
  });

  it("deve tratar caso de borda: Tempo Planejado Zero", () => {
    const res = calculateStandardOee({
      tempoPlanejadoMin: 0,
      tempoParadasNaoPlanejadasMin: 0,
      quantidadeTotalProduzida: 500,
      quantidadeAprovada: 500,
    });

    expect(res.disponibilidade).toBe(0);
    expect(res.performance).toBe(0);
    expect(res.oee).toBe(0);
  });

  it("deve tratar caso de borda: Parada Total (parada não planejada >= tempo planejado)", () => {
    const res = calculateStandardOee({
      tempoPlanejadoMin: 480,
      tempoParadasNaoPlanejadasMin: 500, // Maior que planejado
      quantidadeTotalProduzida: 0,
      quantidadeAprovada: 0,
    });

    expect(res.disponibilidade).toBe(0);
    expect(res.tempoOperacionalMin).toBe(0);
    expect(res.performance).toBe(0);
    expect(res.oee).toBe(0);
  });

  it("deve tratar caso de borda: 100% de Refugo / Qualidade Zero", () => {
    const res = calculateStandardOee({
      tempoPlanejadoMin: 480,
      tempoParadasNaoPlanejadasMin: 0,
      quantidadeTotalProduzida: 1000,
      quantidadeAprovada: 0, // Todas com defeito
      capacidadeNominalPeriodo: 1000,
    });

    expect(res.disponibilidade).toBe(1);
    expect(res.performance).toBe(1);
    expect(res.qualidade).toBe(0);
    expect(res.oee).toBe(0);
    expect(res.quantidadeRefugada).toBe(1000);
    expect(res.firstTimeYieldPercentual).toBe("0.0 %");
  });

  it("deve tratar caso ideal: 100% em todos os pilares (World Class OEE)", () => {
    const res = calculateStandardOee({
      tempoPlanejadoMin: 480,
      tempoParadasNaoPlanejadasMin: 0,
      quantidadeTotalProduzida: 1000,
      quantidadeAprovada: 1000,
      capacidadeNominalPeriodo: 1000,
    });

    expect(res.disponibilidade).toBe(1);
    expect(res.performance).toBe(1);
    expect(res.qualidade).toBe(1);
    expect(res.oee).toBe(1);
    expect(res.oeePercentual).toBe("100.0%");
  });
});

describe("Paridade de OEE Preditivo com Python (`calculadora_oee.py`)", () => {
  it("Classe 0 (Normal): deve bater exatamente com os testes unitários do Python", () => {
    const res = calculatePredictiveOee(0);

    // Python asserts:
    // self.assertEqual(res["disponibilidade"], 0.95)
    // self.assertEqual(res["performance"], 0.92)
    // self.assertEqual(res["qualidade"], 0.98)
    // self.assertEqual(res["oee_percentual"], "85.65%")
    expect(res.disponibilidade).toBe(0.95);
    expect(res.performance).toBe(0.92);
    expect(res.qualidade).toBe(0.98);
    expect(res.oee_calculado).toBe(0.8565);
    expect(res.oee_percentual).toBe("85.65%");
    expect(res.justificativa_impacto).toContain("parâmetros de projeto");
  });

  it("Classe 1 (Desgaste de Ferramenta): penaliza performance (< 0.70)", () => {
    const res = calculatePredictiveOee(1);

    // Python assert: self.assertLess(res["performance"], 0.70)
    expect(res.performance).toBeLessThan(0.70);
    expect(res.performance).toBeCloseTo(DEFAULT_PREDICTIVE_BASELINE.performance * 0.75, 4);
    expect(res.justificativa_impacto).toContain("Performance");
  });

  it("Classe 2 (Falha de Refrigeração): penaliza severamente qualidade (< 0.60)", () => {
    const res = calculatePredictiveOee(2);

    // Python assert: self.assertLess(res["qualidade"], 0.60)
    expect(res.qualidade).toBeLessThan(0.60);
    expect(res.disponibilidade).toBeCloseTo(DEFAULT_PREDICTIVE_BASELINE.availability * 0.80, 4);
    expect(res.justificativa_impacto).toContain("Qualidade");
  });

  it("Classe 3 (Trinca / Desalinhamento): penaliza severamente disponibilidade (<= 0.50)", () => {
    const res = calculatePredictiveOee(3);

    // Python assert: self.assertLess(res["disponibilidade"], 0.50)
    expect(res.disponibilidade).toBeLessThanOrEqual(0.50);
    expect(res.justificativa_impacto).toContain("Disponibilidade");
  });
});

