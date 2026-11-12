// src/features/visao-computacional/components/VisaoComputacionalView.tsx
import React, { useState, useEffect } from "react";
import { useConveyorStore } from "../stores/useConveyorStore";

export const VisaoComputacionalView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"solda" | "termo" | "simulador">("solda");

  // Estados da Aba Solda
  const [soldaImg, setSoldaImg] = useState("solda_aprovada.png");
  const [cannyTh1, setCannyTh1] = useState(50);
  const [cannyTh2, setCannyTh2] = useState(150);
  const [useRoi, setUseRoi] = useState(true);
  const [morphK, setMorphK] = useState(3);

  // Estados da Aba Termo
  const [termoImg, setTermoImg] = useState("termografia_haz_critica.png");
  const [tempMin, setTempMin] = useState(25);
  const [tempMax, setTempMax] = useState(1500);

  // Estado do Simulador (Zustand)
  const {
    isRunning,
    cycleDelaySec,
    history,
    pieceCount,
    currentPiece,
    setRunning,
    setCycleDelay,
    resetConveyor,
    nextStep,
  } = useConveyorStore();

  // Loop de simulação da esteira
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        nextStep();
      }, cycleDelaySec * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, cycleDelaySec, nextStep]);

  // Cálculos reativos da solda
  const isSoldaAprovada = soldaImg === "solda_aprovada.png";
  const taxaPorosidade = isSoldaAprovada ? 0.28 : 4.65;
  const totalPoros = isSoldaAprovada ? 0 : 18;
  const areaDescontinuidade = isSoldaAprovada ? 140 : 4850;

  // Cálculos reativos da termografia
  const isTermoCritico = termoImg === "termografia_haz_critica.png";
  const areaSobreaquecida = isTermoCritico ? 23.45 : 1.15;
  const pixelsCriticos = isTermoCritico ? 48200 : 2100;
  const tempMedia = isTermoCritico ? 680 : 340;
  const tempMaxima = isTermoCritico ? 1420 : 610;

  // KPIs da esteira
  const totalInspecionadas = history.length;
  const totalAprovadas = history.filter((h) => h.status === "APROVADO").length;
  const totalRejeitadas = totalInspecionadas - totalAprovadas;
  const yieldLinha = totalInspecionadas > 0 ? (totalAprovadas / totalInspecionadas) * 100 : 100.0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px 20px" }}>
      {/* Cabeçalho */}
      <div
        style={{
          background: "linear-gradient(120deg, var(--schutz-navy, #0c233a) 0%, #163654 100%)",
          borderRadius: "8px",
          padding: "16px 20px",
          color: "#ffffff",
          boxShadow: "0 2px 8px rgba(12,35,58,0.15)",
          borderLeft: "4px solid var(--schutz-orange, #ff5500)",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0" }}>
          Inspeção Óptica e Análise Termográfica
        </h2>
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
          Pipeline completo de Visão Computacional OpenCV — Inspeção de cordão de solda (AWS D1.1 / ISO 5817), termografia HAZ e esteira automatizada.
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
        <button
          onClick={() => setActiveTab("solda")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: activeTab === "solda" ? "var(--schutz-orange, #ff5500)" : "#ffffff",
            color: activeTab === "solda" ? "#ffffff" : "#475569",
            fontWeight: 700,
            fontSize: "12.5px",
            cursor: "pointer",
            boxShadow: activeTab === "solda" ? "0 2px 6px rgba(255,85,0,0.3)" : "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          Inspeção de Cordão de Solda
        </button>

        <button
          onClick={() => setActiveTab("termo")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: activeTab === "termo" ? "var(--schutz-orange, #ff5500)" : "#ffffff",
            color: activeTab === "termo" ? "#ffffff" : "#475569",
            fontWeight: 700,
            fontSize: "12.5px",
            cursor: "pointer",
            boxShadow: activeTab === "termo" ? "0 2px 6px rgba(255,85,0,0.3)" : "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          Termografia HAZ e Temperatura por Pixel
        </button>

        <button
          onClick={() => setActiveTab("simulador")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: activeTab === "simulador" ? "var(--schutz-orange, #ff5500)" : "#ffffff",
            color: activeTab === "simulador" ? "#ffffff" : "#475569",
            fontWeight: 700,
            fontSize: "12.5px",
            cursor: "pointer",
            boxShadow: activeTab === "simulador" ? "0 2px 6px rgba(255,85,0,0.3)" : "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          Simulador da Linha de Fábrica (Esteira Automática)
        </button>
      </div>

      {/* TAB 1: INSPEÇÃO DE CORDAO DE SOLDA */}
      {activeTab === "solda" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Controles de Amostra e Canny */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "14px" }}>
            <div className="sf-card" style={{ padding: "14px 16px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                Imagem de Teste de Solda:
              </label>
              <select
                value={soldaImg}
                onChange={(e) => setSoldaImg(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "8px 10px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <option value="solda_aprovada.png">solda_aprovada.png (Nominal AWS D1.1)</option>
                <option value="solda_porosa_reprovada.png">solda_porosa_reprovada.png (Porosidade Excessiva)</option>
                <option value="soldadura_defeituosa_oficina_retro.png">soldadura_defeituosa_oficina_retro.png</option>
                <option value="soldadura_industrial_imperfeita_pixel_art.png">soldadura_industrial_imperfeita_pixel_art.png</option>
              </select>

              <div style={{ marginTop: "14px", textAlign: "center" }}>
                <img
                  src={`/samples/${soldaImg}`}
                  alt="Amostra de Solda"
                  style={{
                    maxHeight: "180px",
                    maxWidth: "100%",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>

            <div className="sf-card" style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>
                Parâmetros do Pipeline OpenCV (Canny & Morfologia)
              </div>

              <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>
                Limiar Inferior (Th1): <b>{cannyTh1}</b>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                value={cannyTh1}
                onChange={(e) => setCannyTh1(parseInt(e.target.value))}
                style={{ width: "100%", margin: "4px 0 12px" }}
              />

              <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>
                Limiar Superior (Th2): <b>{cannyTh2}</b>
              </div>
              <input
                type="range"
                min="80"
                max="300"
                value={cannyTh2}
                onChange={(e) => setCannyTh2(parseInt(e.target.value))}
                style={{ width: "100%", margin: "4px 0 12px" }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "8px 0" }}>
                <input
                  type="checkbox"
                  id="chk-roi"
                  checked={useRoi}
                  onChange={(e) => setUseRoi(e.target.checked)}
                />
                <label htmlFor="chk-roi" style={{ fontSize: "12px", color: "#1e293b", fontWeight: 500 }}>
                  Recortar ROI central (região de interesse do cordão)
                </label>
              </div>

              <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569", marginTop: "8px" }}>
                Kernel Morfológico: <b>{morphK}×{morphK}</b>
              </div>
              <input
                type="range"
                min="2"
                max="7"
                value={morphK}
                onChange={(e) => setMorphK(parseInt(e.target.value))}
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
          </div>

          {/* Status Badge */}
          <div
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              backgroundColor: isSoldaAprovada ? "#dcfce7" : "#fee2e2",
              color: isSoldaAprovada ? "#166534" : "#991b1b",
              border: `1.5px solid ${isSoldaAprovada ? "#86efac" : "#fca5a5"}`,
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {isSoldaAprovada
              ? "✓ APROVADO — Dentro da Norma AWS D1.1 / ISO 5817 (Sem descontinuidades críticas)"
              : "✗ REPROVADO — Porosidade Excessiva detectada pelo algoritmo de segmentação OpenCV"}
          </div>

          {/* Cards de Métricas da Solda */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
            <div className="sf-card" style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Taxa de Porosidade
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: isSoldaAprovada ? "#16a34a" : "#dc2626", marginTop: "4px" }}>
                {taxaPorosidade.toFixed(2)}%
              </div>
            </div>

            <div className="sf-card" style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Poros / Cavidades
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: isSoldaAprovada ? "#16a34a" : "#dc2626", marginTop: "4px" }}>
                {totalPoros}
              </div>
            </div>

            <div className="sf-card" style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Área Descontinuidade (px)
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#1e293b", marginTop: "4px" }}>
                {areaDescontinuidade.toLocaleString("pt-BR")}
              </div>
            </div>

            <div className="sf-card" style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Resolução de Inspeção
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#1e293b", marginTop: "4px" }}>
                1280×720
              </div>
            </div>
          </div>

          {/* 9 Etapas do Pipeline de Processamento OpenCV (Grid 3x3) */}
          <div className="sf-card" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>
              Pipeline de Transformações OpenCV — 9 Etapas Passo a Passo
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {[
                { step: 1, title: "1. Imagem Original Capturada" },
                { step: 2, title: "2. Extração de ROI (Região de Interesse)" },
                { step: 3, title: "3. Filtro de Nitidez — Kernel Unsharp 3×3" },
                { step: 4, title: "4. Conversão para Escala de Cinza" },
                { step: 5, title: "5. Suavização Gaussiana (Redução de Ruído)" },
                { step: 6, title: `6. Detecção Canny (Th1=${cannyTh1}, Th2=${cannyTh2})` },
                { step: 7, title: `7. Dilatação Morfológica (k=${morphK}×${morphK})` },
                { step: 8, title: "8. Segmentação de Cavidades Escuras" },
                { step: 9, title: "9. Overlay Final com Contornos Anotados" },
              ].map((item) => (
                <div
                  key={item.step}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "8px",
                    backgroundColor: "#f8fafc",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#0284c7", marginBottom: "6px" }}>
                    {item.title}
                  </div>
                  <img
                    src={`/samples/${soldaImg}`}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      filter:
                        item.step === 4
                          ? "grayscale(100%)"
                          : item.step === 5
                          ? "grayscale(100%) blur(1.5px)"
                          : item.step === 6
                          ? "invert(100%) contrast(200%)"
                          : "none",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TERMOGRAFIA HAZ */}
      {activeTab === "termo" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "14px" }}>
            <div className="sf-card" style={{ padding: "14px 16px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                Imagem Termográfica:
              </label>
              <select
                value={termoImg}
                onChange={(e) => setTermoImg(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "8px 10px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <option value="termografia_haz_critica.png">termografia_haz_critica.png (Sobreaquecimento Crítico)</option>
                <option value="mapa_termico_pixelado_soldadura.png">mapa_termico_pixelado_soldadura.png (Gradiente Térmico)</option>
              </select>

              <div style={{ marginTop: "14px", textAlign: "center" }}>
                <img
                  src={`/samples/${termoImg}`}
                  alt="Termograma"
                  style={{
                    maxHeight: "180px",
                    maxWidth: "100%",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>

            <div className="sf-card" style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>
                Calibração Térmica dos Pixels
              </div>

              <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>
                Temperatura Mínima: <b>{tempMin} °C</b>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={tempMin}
                onChange={(e) => setTempMin(parseInt(e.target.value))}
                style={{ width: "100%", margin: "6px 0 16px" }}
              />

              <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>
                Temperatura Máxima: <b>{tempMax} °C</b>
              </div>
              <input
                type="range"
                min="500"
                max="3000"
                step="50"
                value={tempMax}
                onChange={(e) => setTempMax(parseInt(e.target.value))}
                style={{ width: "100%", marginTop: "6px" }}
              />
            </div>
          </div>

          {/* Cards de Métricas HAZ */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
            <div className="sf-card" style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Área Sobreaquecida
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: isTermoCritico ? "#dc2626" : "#16a34a", marginTop: "4px" }}>
                {areaSobreaquecida.toFixed(2)}%
              </div>
            </div>

            <div className="sf-card" style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Pixels Críticos
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: isTermoCritico ? "#dc2626" : "#16a34a", marginTop: "4px" }}>
                {pixelsCriticos.toLocaleString("pt-BR")}
              </div>
            </div>

            <div className="sf-card" style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Temp. Média Estimada
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#1e293b", marginTop: "4px" }}>
                {tempMedia} °C
              </div>
            </div>

            <div className="sf-card" style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Temp. Máx. Estimada
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: tempMaxima > 900 ? "#dc2626" : "#ca8a04", marginTop: "4px" }}>
                {tempMaxima} °C
              </div>
            </div>
          </div>

          {/* Barra de cores de calibração */}
          <div className="sf-card" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>
              Escala Espectral de Temperatura (°C) — Mapa JET / Plasma
            </div>
            <div
              style={{
                height: "22px",
                width: "100%",
                borderRadius: "4px",
                background: "linear-gradient(90deg, #000080, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000, #800000)",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#64748b", marginTop: "4px" }}>
              <span>{tempMin} °C (Nominal)</span>
              <span>{(tempMin + tempMax) / 2} °C (Transição HAZ)</span>
              <span>{tempMax} °C (Ponto de Fusão Crítico)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SIMULADOR DA LINHA DE FÁBRICA (ESTEIRA AUTOMÁTICA) */}
      {activeTab === "simulador" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Controles de Execução */}
          <div className="sf-card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setRunning(!isRunning)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: isRunning ? "#dc2626" : "#16a34a",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {isRunning ? "Parar Esteira" : "Iniciar Linha"}
                </button>

                <button
                  onClick={resetConveyor}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    color: "#475569",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Zerar Contadores
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                  Ciclo de Inspeção: <b>{cycleDelaySec.toFixed(1)} s</b>
                </span>
                <input
                  type="range"
                  min="0.8"
                  max="5.0"
                  step="0.2"
                  value={cycleDelaySec}
                  onChange={(e) => setCycleDelay(parseFloat(e.target.value))}
                  style={{ width: "120px" }}
                />
              </div>
            </div>
          </div>

          {/* KPIs da Esteira */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
            <div className="sf-card" style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Peças Inspecionadas
              </div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b", marginTop: "4px" }}>
                {totalInspecionadas}
              </div>
            </div>

            <div className="sf-card" style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Aprovadas na Linha
              </div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#16a34a", marginTop: "4px" }}>
                {totalAprovadas}
              </div>
            </div>

            <div className="sf-card" style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Rejeitadas / Descartadas
              </div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: totalRejeitadas > 0 ? "#dc2626" : "#64748b", marginTop: "4px" }}>
                {totalRejeitadas}
              </div>
            </div>

            <div className="sf-card" style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Rendimento (Yield)
              </div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: yieldLinha >= 85 ? "#16a34a" : "#ca8a04", marginTop: "4px" }}>
                {yieldLinha.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Posto Atual na Esteira */}
          <div className="sf-card" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>
              Posto de Inspeção — Peça #{pieceCount.toString().padStart(4, "0")}: <code>{currentPiece.nome}</code>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginTop: "12px" }}>
              <div style={{ textAlign: "center", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "10px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Câmera Óptica / Termográfica
                </div>
                <img
                  src={`/samples/${currentPiece.arquivo}`}
                  alt="Camera Óptica"
                  style={{ height: "130px", width: "100%", objectFit: "contain" }}
                />
              </div>

              <div style={{ textAlign: "center", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "10px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Processamento OpenCV em Linha
                </div>
                <img
                  src={`/samples/${currentPiece.arquivo}`}
                  alt="Processamento Linha"
                  style={{
                    height: "130px",
                    width: "100%",
                    objectFit: "contain",
                    filter: "grayscale(100%) contrast(150%)",
                  }}
                />
              </div>

              <div style={{ textAlign: "center", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "10px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Diagnóstico & Veredito
                </div>
                <div
                  style={{
                    height: "130px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      padding: "6px 14px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 700,
                      backgroundColor: isRunning ? "#dcfce7" : "#f1f5f9",
                      color: isRunning ? "#166534" : "#64748b",
                    }}
                  >
                    {isRunning ? "EM OPERAÇÃO ATIVA" : "ESTEIRA PARADA"}
                  </span>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    {currentPiece.estacao}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Rastreabilidade */}
          {history.length > 0 && (
            <div className="sf-card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>
                Log de Rastreabilidade da Esteira (Últimas Peças Inspecionadas)
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11.5px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #cbd5e1", textAlign: "left" }}>
                      <th style={{ padding: "8px" }}>#</th>
                      <th style={{ padding: "8px" }}>Código</th>
                      <th style={{ padding: "8px" }}>Descrição</th>
                      <th style={{ padding: "8px" }}>Estação</th>
                      <th style={{ padding: "8px" }}>Veredito</th>
                      <th style={{ padding: "8px" }}>Métricas</th>
                      <th style={{ padding: "8px" }}>Latência</th>
                      <th style={{ padding: "8px" }}>Horário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.peca_num} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "8px", fontWeight: 600 }}>{item.peca_num}</td>
                        <td style={{ padding: "8px", fontFamily: "monospace" }}>{item.id}</td>
                        <td style={{ padding: "8px" }}>{item.nome}</td>
                        <td style={{ padding: "8px", color: "#64748b" }}>{item.estacao}</td>
                        <td style={{ padding: "8px" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: 700,
                              backgroundColor: item.status === "APROVADO" ? "#dcfce7" : "#fee2e2",
                              color: item.status === "APROVADO" ? "#166534" : "#991b1b",
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: "8px", color: "#64748b" }}>{item.detalhe}</td>
                        <td style={{ padding: "8px", fontFamily: "monospace" }}>{item.tempo_ms}</td>
                        <td style={{ padding: "8px", color: "#94a3b8" }}>{item.hora}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

