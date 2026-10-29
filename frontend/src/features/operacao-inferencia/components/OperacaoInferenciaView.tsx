// src/features/operacao-inferencia/components/OperacaoInferenciaView.tsx
import React, { useState, useMemo } from "react";
import {
  evaluateIndustrialAction,
  inferFailureFromTelemetry,
  TelemetryValues,
} from "../services/decisionEngine";
import { calculatePredictiveOee } from "../../oee/services/oeeCalculator";

export const OperacaoInferenciaView: React.FC = () => {
  const [idCelula, setIdCelula] = useState("CEL-201");
  const [ligaMetalica, setLigaMetalica] = useState("Liga_Titanio_Ti6Al4V");

  const [telemetry, setTelemetry] = useState<TelemetryValues>({
    temp: 52.0,
    vib: 2.1,
    torque: 115.0,
    vazao: 26.0,
    corrente: 28.0,
    pressao: 160.0,
    ruido: 62.0,
  });

  const handleSliderChange = (field: keyof TelemetryValues, val: number) => {
    setTelemetry((prev) => ({ ...prev, [field]: val }));
  };

  // Inferência e avaliação em tempo real
  const inference = useMemo(() => {
    return inferFailureFromTelemetry(telemetry);
  }, [telemetry]);

  const decision = useMemo(() => {
    return evaluateIndustrialAction(inference.classId, inference.confidence);
  }, [inference]);

  const oeeImpact = useMemo(() => {
    return calculatePredictiveOee(inference.classId);
  }, [inference]);

  // Tom de cor do status
  const toneColor =
    decision.acao_recomendada === "MANTER_OPERACAO"
      ? { bg: "#dcfce7", text: "#166534", border: "#86efac", metric: "#16a34a" }
      : decision.acao_recomendada === "REDUZIR_VELOCIDADE_50%"
      ? { bg: "#fef9c3", text: "#854d0e", border: "#fde047", metric: "#ca8a04" }
      : { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5", metric: "#dc2626" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px", padding: "16px 20px" }}>
      {/* Cabeçalho da Visão */}
      <div
        style={{
          background: "linear-gradient(120deg, #1e293b 0%, #334155 100%)",
          borderRadius: "8px",
          padding: "16px 20px",
          color: "#ffffff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0" }}>
          Painel Operacional da Célula de Manufatura
        </h2>
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
          Diagnóstico preditivo em tempo real com despacho de comandos para o CLP via malha fechada (ISO/IEC/IEEE 42010).
        </div>
      </div>

      {/* Seletores de Contexto */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div className="sf-card" style={{ padding: "12px 16px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
            Célula de Manufatura:
          </label>
          <select
            value={idCelula}
            onChange={(e) => setIdCelula(e.target.value)}
            style={{
              width: "100%",
              marginTop: "6px",
              padding: "7px 10px",
              borderRadius: "4px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <option value="CEL-201">CEL-201 (Braço Solda #1)</option>
            <option value="CEL-202">CEL-202 (Braço Solda #2)</option>
            <option value="CEL-203">CEL-203 (Inspeção Robótica)</option>
            <option value="CEL-204">CEL-204 (Câmara Térmica IR)</option>
          </select>
        </div>

        <div className="sf-card" style={{ padding: "12px 16px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
            Liga Metálica em Processamento:
          </label>
          <select
            value={ligaMetalica}
            onChange={(e) => setLigaMetalica(e.target.value)}
            style={{
              width: "100%",
              marginTop: "6px",
              padding: "7px 10px",
              borderRadius: "4px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <option value="Liga_Titanio_Ti6Al4V">Liga_Titanio_Ti6Al4V</option>
            <option value="Aluminio_7075">Aluminio_7075</option>
            <option value="Aco_Carbono_316L">Aco_Carbono_316L</option>
          </select>
        </div>
      </div>

      {/* Sliders de Telemetria */}
      <div className="sf-card" style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "14px" }}>
          Telemetria dos Sensores de Processo
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {/* Col 1 */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>
              Temperatura do Fuso: <b>{telemetry.temp.toFixed(1)} °C</b>
            </div>
            <input
              type="range"
              min="20.0"
              max="150.0"
              step="0.5"
              value={telemetry.temp}
              onChange={(e) => handleSliderChange("temp", parseFloat(e.target.value))}
              style={{ width: "100%", margin: "8px 0 16px" }}
            />

            <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>
              Vibração RMS: <b>{telemetry.vib.toFixed(1)} mm/s</b>
            </div>
            <input
              type="range"
              min="0.5"
              max="12.0"
              step="0.1"
              value={telemetry.vib}
              onChange={(e) => handleSliderChange("vib", parseFloat(e.target.value))}
              style={{ width: "100%", marginTop: "8px" }}
            />
          </div>

          {/* Col 2 */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>
              Torque do Fuso: <b>{telemetry.torque.toFixed(0)} Nm</b>
            </div>
            <input
              type="range"
              min="40.0"
              max="250.0"
              step="1.0"
              value={telemetry.torque}
              onChange={(e) => handleSliderChange("torque", parseFloat(e.target.value))}
              style={{ width: "100%", margin: "8px 0 16px" }}
            />

            <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>
              Vazão Refrigerante: <b>{telemetry.vazao.toFixed(1)} L/min</b>
            </div>
            <input
              type="range"
              min="0.0"
              max="45.0"
              step="0.5"
              value={telemetry.vazao}
              onChange={(e) => handleSliderChange("vazao", parseFloat(e.target.value))}
              style={{ width: "100%", marginTop: "8px" }}
            />
          </div>

          {/* Col 3 */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>
              Corrente Estator: <b>{telemetry.corrente.toFixed(1)} A</b>
            </div>
            <input
              type="range"
              min="10.0"
              max="60.0"
              step="0.5"
              value={telemetry.corrente}
              onChange={(e) => handleSliderChange("corrente", parseFloat(e.target.value))}
              style={{ width: "100%", margin: "8px 0 16px" }}
            />

            <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>
              Pressão Hidráulica: <b>{telemetry.pressao.toFixed(0)} Bar</b>
            </div>
            <input
              type="range"
              min="100.0"
              max="230.0"
              step="1.0"
              value={telemetry.pressao}
              onChange={(e) => handleSliderChange("pressao", parseFloat(e.target.value))}
              style={{ width: "100%", marginTop: "8px" }}
            />
          </div>

          {/* Col 4 */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>
              Nível de Ruído: <b>{telemetry.ruido.toFixed(1)} dB</b>
            </div>
            <input
              type="range"
              min="40.0"
              max="95.0"
              step="0.5"
              value={telemetry.ruido}
              onChange={(e) => handleSliderChange("ruido", parseFloat(e.target.value))}
              style={{ width: "100%", margin: "8px 0 16px" }}
            />
          </div>
        </div>
      </div>

      {/* Diagnóstico e Prescrição em Malha Fechada */}
      <div className="sf-card" style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>
          Diagnóstico e Prescrição em Malha Fechada
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
          <div style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", textAlign: "center" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Estado Operacional
            </div>
            <div style={{ fontSize: "17px", fontWeight: 700, color: toneColor.metric, marginTop: "6px" }}>
              {inference.className}
            </div>
          </div>

          <div style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", textAlign: "center" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Confiança da IA
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: toneColor.metric, marginTop: "4px" }}>
              {(inference.confidence * 100).toFixed(1)}%
            </div>
          </div>

          <div style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", textAlign: "center" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Ação CLP
            </div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: toneColor.metric, marginTop: "6px" }}>
              {decision.acao_recomendada}
            </div>
          </div>

          <div style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", textAlign: "center" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Código CLP (HEX)
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", fontFamily: "monospace", marginTop: "4px" }}>
              {decision.codigo_clp_hex}
            </div>
          </div>
        </div>

        {/* Badge da Diretriz */}
        <div
          style={{
            marginTop: "14px",
            padding: "10px 16px",
            backgroundColor: toneColor.bg,
            color: toneColor.text,
            border: `1.5px solid ${toneColor.border}`,
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {decision.diretriz_operacional}
        </div>
      </div>

      {/* Impacto Preditivo no OEE */}
      <div className="sf-card" style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>
          Impacto Preditivo no OEE (RF-010)
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
          <div style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", textAlign: "center" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Disponibilidade
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: oeeImpact.disponibilidade >= 0.8 ? "#16a34a" : "#dc2626", marginTop: "4px" }}>
              {(oeeImpact.disponibilidade * 100).toFixed(1)}%
            </div>
          </div>

          <div style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", textAlign: "center" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Performance
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: oeeImpact.performance >= 0.8 ? "#16a34a" : "#dc2626", marginTop: "4px" }}>
              {(oeeImpact.performance * 100).toFixed(1)}%
            </div>
          </div>

          <div style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", textAlign: "center" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Qualidade
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: oeeImpact.qualidade >= 0.8 ? "#16a34a" : "#dc2626", marginTop: "4px" }}>
              {(oeeImpact.qualidade * 100).toFixed(1)}%
            </div>
          </div>

          <div style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", textAlign: "center" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              OEE Geral Preditivo
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", marginTop: "4px" }}>
              {oeeImpact.oee_percentual}
            </div>
          </div>
        </div>

        <div style={{ fontSize: "11px", fontStyle: "italic", color: "#64748b", marginTop: "10px" }}>
          {oeeImpact.justificativa_impacto}
        </div>
      </div>
    </div>
  );
};

