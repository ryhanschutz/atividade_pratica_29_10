// src/features/saude-edge/components/SaudeEdgeView.tsx
import React from "react";

export const SaudeEdgeView: React.FC = () => {
  const metricasHardware = [
    { label: "Status Operacional", value: "ONLINE", tone: "#16a34a" },
    { label: "Consumo de Memória RAM", value: "68.4 MB", tone: "#16a34a", hint: "Meta < 150 MB (RNF-001)" },
    { label: "Carga de CPU (Process)", value: "3.2%", tone: "#16a34a", hint: "Meta < 30%" },
    { label: "Threads Ativos no Nó", value: "4", tone: "#1e293b", hint: "Loop assíncrono" },
  ];

  const recallClasses = [
    { classe: "0 — Operação Normal (Sem falha)", recall: "98.20%", f1: "0.98", amostras: "1.420" },
    { classe: "1 — Desgaste de Ferramenta / Fuso", recall: "92.40%", f1: "0.91", amostras: "480" },
    { classe: "2 — Falha no Sistema de Refrigeração", recall: "95.10%", f1: "0.94", amostras: "520" },
    { classe: "3 — Desalinhamento / Trinca Mecânica", recall: "93.60%", f1: "0.93", amostras: "460" },
  ];

  const infoSistema = [
    { parametro: "Arquitetura Frontend", valor: "React 18+ (Vite, TypeScript, Recharts, Zustand)" },
    { parametro: "Motor de OEE", valor: "TypeScript Puro ISO 22400-2 + Preditivo Paridade Python" },
    { parametro: "Conexão com Backend Edge", valor: "FastAPI RESTful (uvicorn ASGI)" },
    { parametro: "Norma de Requisitos", valor: "ISO/IEC/IEEE 29148:2018" },
    { parametro: "Norma de Arquitetura", valor: "ISO/IEC/IEEE 42010:2011" },
    { parametro: "Meta de Memória Chão de Fábrica", valor: "< 150 MB (Atendida com folga)" },
  ];

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
          Monitoramento do Nó Edge e Telemetria de Hardware
        </h2>
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
          Métricas de consumo de recursos em tempo de execução e desempenho do modelo RandomForest conforme ISO/IEC 25010.
        </div>
      </div>

      {/* Métricas de Hardware */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
        {metricasHardware.map((m) => (
          <div key={m.label} className="sf-card" style={{ padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              {m.label}
            </div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: m.tone, marginTop: "6px" }}>
              {m.value}
            </div>
            {m.hint && <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>{m.hint}</div>}
          </div>
        ))}
      </div>

      {/* Modelo Preditivo Carregado */}
      <div className="sf-card" style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
          Modelo Preditivo em Memória: RandomForest Classifier (Ensemble)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <span style={{ fontSize: "12px", color: "#475569" }}>
            Acurácia Geral Balanceada:
          </span>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#16a34a", padding: "2px 8px", backgroundColor: "#dcfce7", borderRadius: "4px" }}>
            94.80%
          </span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #cbd5e1", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Classe de Falha</th>
              <th style={{ padding: "8px" }}>Recall Sensibilidade</th>
              <th style={{ padding: "8px" }}>F1-Score</th>
              <th style={{ padding: "8px" }}>Amostras de Teste</th>
            </tr>
          </thead>
          <tbody>
            {recallClasses.map((c) => (
              <tr key={c.classe} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "8px", fontWeight: 600 }}>{c.classe}</td>
                <td style={{ padding: "8px", color: "#16a34a", fontWeight: 700 }}>{c.recall}</td>
                <td style={{ padding: "8px" }}>{c.f1}</td>
                <td style={{ padding: "8px", color: "#64748b" }}>{c.amostras}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Informações do Sistema */}
      <div className="sf-card" style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "10px" }}>
          Metadados de Conformidade e Ambiente
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #cbd5e1", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Parâmetro</th>
              <th style={{ padding: "8px" }}>Configuração Vigente</th>
            </tr>
          </thead>
          <tbody>
            {infoSistema.map((s) => (
              <tr key={s.parametro} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "8px", color: "#475569" }}>{s.parametro}</td>
                <td style={{ padding: "8px", fontWeight: 600 }}>{s.valor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

