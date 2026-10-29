// src/features/saneamento-dados/components/SaneamentoDadosView.tsx
import React, { useState } from "react";

export const SaneamentoDadosView: React.FC = () => {
  const [pipelineExecutado, setPipelineExecutado] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const regrasSaneamento = [
    { sensor: "temperatura_fuso_c", faixa: "0 – 250 °C", ruidos: "999.9 °C" },
    { sensor: "vibracao_triaxial_rms_mms", faixa: "0 – 50 mm/s", ruidos: "-99.0 mm/s" },
    { sensor: "torque_fuso_nm", faixa: "0 – 500 Nm", ruidos: "—" },
    { sensor: "vazao_refrigerante_lmin", faixa: "0 – 100 L/min", ruidos: "—" },
    { sensor: "corrente_estator_amp", faixa: "0 – 150 A", ruidos: "—" },
    { sensor: "pressao_hidraulica_bar", faixa: "0 – 400 Bar", ruidos: "-1.0 Bar" },
    { sensor: "nivel_ruido_db", faixa: "20 – 140 dB", ruidos: "—" },
  ];

  const nanDiagnostico = [
    { sensor: "temperatura_fuso_c", nans: 48, perc: "1.67%" },
    { sensor: "vibracao_triaxial_rms_mms", nans: 35, perc: "1.22%" },
    { sensor: "torque_fuso_nm", nans: 12, perc: "0.42%" },
    { sensor: "vazao_refrigerante_lmin", nans: 28, perc: "0.97%" },
    { sensor: "corrente_estator_amp", nans: 19, perc: "0.66%" },
    { sensor: "pressao_hidraulica_bar", nans: 42, perc: "1.46%" },
    { sensor: "nivel_ruido_db", nans: 16, perc: "0.56%" },
  ];

  const amostraBruta = [
    { timestamp: "2024-04-01 08:00", celula: "CEL-201", liga: "Liga_Titanio_Ti6Al4V", temp: "52.4", vib: "2.1", torque: "115", vazao: "26.0", corrente: "28.4", pressao: "160", ruido: "62.5" },
    { timestamp: "2024-04-01 08:05", celula: "CEL-201", liga: "Liga_Titanio_Ti6Al4V", temp: "999.9", vib: "2.3", torque: "118", vazao: "25.8", corrente: "29.1", pressao: "161", ruido: "63.0" },
    { timestamp: "2024-04-01 08:10", celula: "CEL-201", liga: "Liga_Titanio_Ti6Al4V", temp: "53.8", vib: "-99.0", torque: "120", vazao: "25.5", corrente: "29.8", pressao: "159", ruido: "63.2" },
    { timestamp: "2024-04-01 08:15", celula: "CEL-201", liga: "Liga_Titanio_Ti6Al4V", temp: "54.1", vib: "2.5", torque: "122", vazao: "NaN", corrente: "30.2", pressao: "162", ruido: "64.0" },
    { timestamp: "2024-04-01 08:20", celula: "CEL-201", liga: "Liga_Titanio_Ti6Al4V", temp: "54.5", vib: "2.6", torque: "121", vazao: "25.2", corrente: "30.0", pressao: "-1.0", ruido: "63.8" },
  ];

  const amostraSaneada = [
    { timestamp: "2024-04-01 08:00", celula: "CEL-201", liga: "Liga_Titanio_Ti6Al4V", temp: "52.4", vib: "2.1", torque: "115", vazao: "26.0", corrente: "28.4", pressao: "160", ruido: "62.5" },
    { timestamp: "2024-04-01 08:05", celula: "CEL-201", liga: "Liga_Titanio_Ti6Al4V", temp: "53.1", vib: "2.3", torque: "118", vazao: "25.8", corrente: "29.1", pressao: "161", ruido: "63.0" },
    { timestamp: "2024-04-01 08:10", celula: "CEL-201", liga: "Liga_Titanio_Ti6Al4V", temp: "53.8", vib: "2.4", torque: "120", vazao: "25.5", corrente: "29.8", pressao: "159", ruido: "63.2" },
    { timestamp: "2024-04-01 08:15", celula: "CEL-201", liga: "Liga_Titanio_Ti6Al4V", temp: "54.1", vib: "2.5", torque: "122", vazao: "25.4", corrente: "30.2", pressao: "162", ruido: "64.0" },
    { timestamp: "2024-04-01 08:20", celula: "CEL-201", liga: "Liga_Titanio_Ti6Al4V", temp: "54.5", vib: "2.6", torque: "121", vazao: "25.2", corrente: "30.0", pressao: "160.5", ruido: "63.8" },
  ];

  const handleExecutarPipeline = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPipelineExecutado(true);
    }, 600);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px", padding: "16px 20px" }}>
      {/* Header */}
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
          Saneamento de Dados Industriais
        </h2>
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
          Tratamento de ruídos físicos de sensores, quantificação de NaNs e interpolação temporal condicional por célula (ISO/IEC/IEEE 29148).
        </div>
      </div>

      {/* Métricas do Dataset */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
        <div className="sf-card" style={{ padding: "14px", textAlign: "center" }}>
          <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            Total de Registros
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b", marginTop: "4px" }}>
            2.880
          </div>
        </div>

        <div className="sf-card" style={{ padding: "14px", textAlign: "center" }}>
          <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            Células Monitoradas
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b", marginTop: "4px" }}>
            4
          </div>
        </div>

        <div className="sf-card" style={{ padding: "14px", textAlign: "center" }}>
          <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            Ligas Metálicas
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b", marginTop: "4px" }}>
            3
          </div>
        </div>
      </div>

      {/* Regras de Saneamento */}
      <div className="sf-card" style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "10px" }}>
          Regras de Saneamento e Limites Físicos dos Sensores
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #cbd5e1", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Sensor</th>
              <th style={{ padding: "8px" }}>Faixa Válida</th>
              <th style={{ padding: "8px" }}>Ruídos Explícitos Tratados</th>
            </tr>
          </thead>
          <tbody>
            {regrasSaneamento.map((r) => (
              <tr key={r.sensor} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "8px", fontFamily: "monospace", fontWeight: 600 }}>{r.sensor}</td>
                <td style={{ padding: "8px" }}>{r.faixa}</td>
                <td style={{ padding: "8px", color: "#dc2626", fontWeight: 600 }}>{r.ruidos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Diagnóstico de NaNs */}
      <div className="sf-card" style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "10px" }}>
          Diagnóstico de Ausência de Dados (NaNs) por Canal de Sensor
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #cbd5e1", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Sensor</th>
              <th style={{ padding: "8px" }}>Valores Nulos (NaN)</th>
              <th style={{ padding: "8px" }}>Percentual de Perda</th>
            </tr>
          </thead>
          <tbody>
            {nanDiagnostico.map((d) => (
              <tr key={d.sensor} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "8px", fontFamily: "monospace" }}>{d.sensor}</td>
                <td style={{ padding: "8px", fontWeight: 600 }}>{d.nans}</td>
                <td style={{ padding: "8px", color: "#ca8a04", fontWeight: 600 }}>{d.perc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botão de Execução do Pipeline */}
      <div className="sf-card" style={{ padding: "16px 20px" }}>
        <button
          onClick={handleExecutarPipeline}
          disabled={isProcessing}
          style={{
            padding: "10px 24px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#0284c7",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(2, 132, 199, 0.4)",
          }}
        >
          {isProcessing ? "Executando Filtros Z-Score e Interpolação..." : "Executar Pipeline de Saneamento Completo"}
        </button>

        {pipelineExecutado && (
          <div style={{ marginTop: "16px" }}>
            <div
              style={{
                padding: "10px 16px",
                borderRadius: "6px",
                backgroundColor: "#dcfce7",
                color: "#166534",
                border: "1.5px solid #86efac",
                fontSize: "12.5px",
                fontWeight: 700,
                marginBottom: "14px",
              }}
            >
              ✓ Pipeline concluído — 2.880 registros saneados com interpolação temporal condicional por máquina
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>Antes do Saneamento</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#dc2626", marginTop: "4px" }}>
                  NaNs totais: 200 (6.94%)
                </div>
              </div>

              <div style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>Após Saneamento</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#16a34a", marginTop: "4px" }}>
                  NaNs restantes: 0 (0.00%)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Amostra dos Dados */}
      <div className="sf-card" style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "10px" }}>
          {pipelineExecutado ? "Amostra dos Dados Saneados (Limpos)" : "Amostra dos Dados Brutos com Ruído Industrial"}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #cbd5e1", textAlign: "left" }}>
                <th style={{ padding: "6px" }}>Timestamp</th>
                <th style={{ padding: "6px" }}>Célula</th>
                <th style={{ padding: "6px" }}>Liga</th>
                <th style={{ padding: "6px" }}>Temp (°C)</th>
                <th style={{ padding: "6px" }}>Vib (mm/s)</th>
                <th style={{ padding: "6px" }}>Torque (Nm)</th>
                <th style={{ padding: "6px" }}>Vazão (L/min)</th>
                <th style={{ padding: "6px" }}>Corrente (A)</th>
                <th style={{ padding: "6px" }}>Pressão (Bar)</th>
                <th style={{ padding: "6px" }}>Ruído (dB)</th>
              </tr>
            </thead>
            <tbody>
              {(pipelineExecutado ? amostraSaneada : amostraBruta).map((row, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "6px", fontFamily: "monospace" }}>{row.timestamp}</td>
                  <td style={{ padding: "6px" }}>{row.celula}</td>
                  <td style={{ padding: "6px" }}>{row.liga}</td>
                  <td style={{ padding: "6px", fontWeight: row.temp === "999.9" ? 700 : 400, color: row.temp === "999.9" ? "#dc2626" : "inherit" }}>{row.temp}</td>
                  <td style={{ padding: "6px", fontWeight: row.vib === "-99.0" ? 700 : 400, color: row.vib === "-99.0" ? "#dc2626" : "inherit" }}>{row.vib}</td>
                  <td style={{ padding: "6px" }}>{row.torque}</td>
                  <td style={{ padding: "6px", color: row.vazao === "NaN" ? "#dc2626" : "inherit" }}>{row.vazao}</td>
                  <td style={{ padding: "6px" }}>{row.corrente}</td>
                  <td style={{ padding: "6px", color: row.pressao === "-1.0" ? "#dc2626" : "inherit" }}>{row.pressao}</td>
                  <td style={{ padding: "6px" }}>{row.ruido}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

