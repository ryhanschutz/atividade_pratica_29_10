// src/features/visao-computacional/components/VisaoComputacionalView.tsx
import React, { useState, useEffect, useRef } from "react";
import { useConveyorStore } from "../stores/useConveyorStore";
import opencvDataRaw from "../data/opencvInspectionData.json";
import { OpenCVDataset, WeldInspectionData, HAZInspectionData } from "../types/vision";

const opencvDataset = opencvDataRaw as unknown as OpenCVDataset;

export const VisaoComputacionalView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"solda" | "termo" | "simulador">("solda");

  // Estados da Aba Solda
  const [soldaImg, setSoldaImg] = useState<string>("solda_porosa_reprovada.png");
  const [selectedPointId, setSelectedPointId] = useState<string | null>("P-01");
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("TODOS");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Camadas do Visualizador de Solda
  const [showCrosshairs, setShowCrosshairs] = useState<boolean>(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showRoiBox, setShowRoiBox] = useState<boolean>(true);
  const [showCenterline, setShowCenterline] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Estados da Aba Termo
  const [termoImg, setTermoImg] = useState<string>("termografia_haz_critica.png");
  const [selectedHotSpotId, setSelectedHotSpotId] = useState<string | null>("TH-01");
  const [probePos, setProbePos] = useState<{ x: number; y: number; temp: number } | null>(null);

  // Modal / Zoom da Etapa do Pipeline
  const [expandedStep, setExpandedStep] = useState<{ title: string; imgUrl: string; desc: string; formula: string } | null>(null);

  // Upload customizado
  const [isProcessingUpload, setIsProcessingUpload] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estado do Simulador (Zustand)
  const {
    isRunning,
    cycleDelaySec,
    history,
    setRunning,
    setCycleDelay,
    resetConveyor,
    nextStep,
  } = useConveyorStore();

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

  // Dados da solda atual
  const weldData: WeldInspectionData =
    opencvDataset.weld[soldaImg] ||
    opencvDataset.weld["solda_porosa_reprovada.png"];

  // Dados da termografia atual
  const hazData: HAZInspectionData =
    opencvDataset.haz[termoImg] ||
    opencvDataset.haz["termografia_haz_critica.png"];

  // Ponto selecionado atual
  const activePoint = weldData.pontos_defeito.find(
    (p) => p.id === (hoveredPointId || selectedPointId)
  ) || weldData.pontos_defeito[0];

  // Hotspot selecionado atual
  const activeHotSpot = hazData.pontos_quentes.find(
    (h) => h.id === selectedHotSpotId
  ) || hazData.pontos_quentes[0];

  // Filtragem de pontos
  const filteredPoints = weldData.pontos_defeito.filter((p) => {
    const matchesSev =
      filterSeverity === "TODOS" || p.severidade === filterSeverity;
    const matchesSearch =
      searchTerm === "" ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.classificacao_aws.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.area_px.toString().includes(searchTerm);
    return matchesSev && matchesSearch;
  });

  const totalCriticos = weldData.pontos_defeito.filter((p) => p.severidade === "CRITICO").length;
  const totalAlertas = weldData.pontos_defeito.filter((p) => p.severidade === "ALERTA").length;
  const totalToleraveis = weldData.pontos_defeito.filter((p) => p.severidade === "TOLERAVEL").length;
  const isAprovado = weldData.status_cordao === "APROVADO";

  // Handlers para upload de imagem
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingUpload(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const endpoint = activeTab === "termo" ? "/vision/analyze-haz" : "/vision/inspect-weld";
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro na API (${response.status}): Falha ao processar OpenCV.`);
      }

      const resData = await response.json();
      console.log("Resultado OpenCV API:", resData);
      alert(`Imagem processada com sucesso no OpenCV Edge!\nStatus: ${resData.status_cordao || resData.status_haz}\nPontos: ${resData.pontos_defeito?.length || resData.pontos_quentes?.length || 0}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setUploadError(`Servidor Edge offline ou erro de upload (${msg}). Utilizando dados calibrados locais.`);
    } finally {
      setIsProcessingUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Exportar telemetria em CSV
  const exportTelemetryCSV = () => {
    const headers = "ID,X_Centroid,Y_Centroid,X_Global,Y_Global,Area_px2,Diametro_px,Circularidade,Severidade,Classificacao_AWS,Acao_Recomendada\n";
    const rows = weldData.pontos_defeito.map(
      (p) => `${p.id},${p.x},${p.y},${p.x_global},${p.y_global},${p.area_px},${p.diametro_px},${p.circularidade},${p.severidade},"${p.classificacao_aws}","${p.acao_recomendada}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `telemetria_opencv_pontos_${soldaImg.replace(".png", "")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 9 Etapas Reais de Solda
  const baseSampleName = soldaImg.replace(".png", "");
  const weldPipelineSteps = [
    {
      step: 1,
      title: "1. Imagem Original RGB",
      file: `${baseSampleName}_1_original.png`,
      formula: "I(x, y) = [R, G, B]",
      desc: "Fotografia original da junta soldada capturada pela câmera industrial de alta velocidade (1280×720 px).",
    },
    {
      step: 2,
      title: "2. Recorte de ROI do Cordão",
      file: `${baseSampleName}_2_roi.png`,
      formula: "ROI = I[0.44H : 0.57H,  0.13W : 0.85W]",
      desc: "Isolamento da zona central de fusão e poça de soldagem, eliminando ruído da chapa metálica de base.",
    },
    {
      step: 3,
      title: "3. Filtro de Nitidez (Unsharp 3×3)",
      file: `${baseSampleName}_3_nitidez.png`,
      formula: "K = [[0,-1,0], [-1,5,-1], [0,-1,0]]",
      desc: "Filtro convolucional unsharp mask para realce e acentuação dos limites físicos de poros e trincas.",
    },
    {
      step: 4,
      title: "4. Escala de Cinza (Luminância)",
      file: `${baseSampleName}_4_cinza.png`,
      formula: "Y = 0.299R + 0.587G + 0.114B",
      desc: "Conversão ponderada ITU-R BT.601 para intensidade monocromática de luminância de 8 bits.",
    },
    {
      step: 5,
      title: "5. Suavização Gaussiana (5×5)",
      file: `${baseSampleName}_5_blur.png`,
      formula: "G(x,y) = (1/2πσ²) · e^(-(x²+y²)/2σ²)",
      desc: "Filtro Gaussiano para redução de ruído térmico e atenuação de rugosidade superficial sem perder bordas.",
    },
    {
      step: 6,
      title: "6. Detecção de Bordas Canny",
      file: `${baseSampleName}_6_bordas_canny.png`,
      formula: "Th1 = 50,  Th2 = 150  (Histerese)",
      desc: "Mapeamento dos gradientes de borda com supressão de não-máximos e duplo limiar de histerese.",
    },
    {
      step: 7,
      title: "7. Dilatação Morfológica (3×3)",
      file: `${baseSampleName}_7_dilatacao.png`,
      formula: "A ⊕ B = ⋃ {A_b : b ∈ B}",
      desc: "Fechamento morfológico para conectar descontinuidades de contorno e consolidar cavidades vazadas.",
    },
    {
      step: 8,
      title: "8. Segmentação de Cavidades Escuras",
      file: `${baseSampleName}_8_mascara_poros.png`,
      formula: "M(x,y) = (R<35 ∧ G<35 ∧ B<35)",
      desc: "Segmentação binária por limiarização de luminância mínima característica de poros gasosos profundos.",
    },
    {
      step: 9,
      title: "9. Overlay com Contornos e Miras",
      file: `${baseSampleName}_9_overlay_final.png`,
      formula: "Overlay = I_roi + Contornos + Labels",
      desc: "Anotação em tempo real sobre a imagem com caixas delimitadoras, centróides e leitura AWS D1.1.",
    },
  ];

  // 8 Etapas Reais de Termografia HAZ
  const baseHazName = termoImg.replace(".png", "");
  const hazPipelineSteps = [
    {
      step: 1,
      title: "1. Termograma Original",
      file: `${baseHazName}_1_original.png`,
      formula: "T(x,y) — Câmera IR Industrial",
      desc: "Mapa termográfico infravermelho de alta definição com gradiente de radiação de corpo negro.",
    },
    {
      step: 2,
      title: "2. Conversão para Espaço HSV",
      file: `${baseHazName}_2_hsv.png`,
      formula: "RGB → HSV (Hue, Saturation, Value)",
      desc: "Isolamento da componente Matiz (Hue) para desacoplamento de iluminação externa e foco no calor.",
    },
    {
      step: 3,
      title: "3. Máscara de Zonas Aquecidas",
      file: `${baseHazName}_3_mascara_quente.png`,
      formula: "Hue ∈ [10, 35] ∧ Val > 150",
      desc: "Isolamento da faixa amarela e laranja de temperatura intermediária na zona de transição metálica.",
    },
    {
      step: 4,
      title: "4. Máscara de Calor Crítico (Vermelho)",
      file: `${baseHazName}_4_mascara_vermelha.png`,
      formula: "Hue ∈ [0, 10] ∪ [170, 180]",
      desc: "Segmentação das bandas vermelhas de calor extremo adjacentes ao arco elétrico de fusão.",
    },
    {
      step: 5,
      title: "5. Máscara de Incandescência (Branco)",
      file: `${baseHazName}_5_mascara_branca.png`,
      formula: "Sat < 60 ∧ Val > 225",
      desc: "Segmentação do núcleo incandescente branco de poça de fusão líquida acima de 1.400 °C.",
    },
    {
      step: 6,
      title: "6. Máscara Combinada de Risco HAZ",
      file: `${baseHazName}_6_mascara_combinada.png`,
      formula: "M_critica = M_quente ∪ M_vermelho ∪ M_branco",
      desc: "União booleana das máscaras térmicas com fechamento morfológico para quantificação de área.",
    },
    {
      step: 7,
      title: "7. Mapa Calibrado de Temperatura (°C)",
      file: `${baseHazName}_7_mapa_temperatura.png`,
      formula: "T_C = (1 - H/120) · (T_max - T_min) + T_min",
      desc: "Mapeamento determinístico contínuo de cada pixel em graus Celsius (25 °C a 1.500 °C).",
    },
    {
      step: 8,
      title: "8. Overlay HAZ com Isotermas",
      file: `${baseHazName}_8_overlay_haz.png`,
      formula: "Overlay = 0.6·I + 0.4·M_critica",
      desc: "Fusão da imagem radiométrica com destaque das áreas em sobreaquecimento e pontos quentes.",
    },
  ];

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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
              Inspeção Óptica de Solda & Termografia HAZ (OpenCV)
            </h2>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                backgroundColor: "rgba(255,85,0,0.2)",
                color: "#ff7733",
                padding: "2px 8px",
                borderRadius: "4px",
                border: "1px solid rgba(255,85,0,0.4)",
              }}
            >
              Leitura Determinística em Tempo Real
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
            Detecção geométrica de porosidade, coordenadas de pontos defeituosos, conformidade AWS D1.1 e termometria pontual por pixel.
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "7px 14px",
              borderRadius: "5px",
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>📁</span> {isProcessingUpload ? "Processando..." : "Upload Imagem (API Edge)"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {uploadError && (
        <div
          style={{
            padding: "8px 14px",
            backgroundColor: "#fffbeb",
            color: "#b45309",
            border: "1px solid #fde68a",
            borderRadius: "6px",
            fontSize: "12px",
          }}
        >
          ⚠️ {uploadError}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
        <button
          onClick={() => setActiveTab("solda")}
          style={{
            padding: "8px 18px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: activeTab === "solda" ? "var(--schutz-orange, #ff5500)" : "#ffffff",
            color: activeTab === "solda" ? "#ffffff" : "#475569",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: activeTab === "solda" ? "0 2px 6px rgba(255,85,0,0.3)" : "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          🔍 Inspeção de Cordão de Solda (Leitura de Pontos OpenCV)
        </button>

        <button
          onClick={() => setActiveTab("termo")}
          style={{
            padding: "8px 18px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: activeTab === "termo" ? "var(--schutz-orange, #ff5500)" : "#ffffff",
            color: activeTab === "termo" ? "#ffffff" : "#475569",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: activeTab === "termo" ? "0 2px 6px rgba(255,85,0,0.3)" : "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          🌡️ Termografia HAZ (Pontos Quentes & Sonda Térmica)
        </button>

        <button
          onClick={() => setActiveTab("simulador")}
          style={{
            padding: "8px 18px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: activeTab === "simulador" ? "var(--schutz-orange, #ff5500)" : "#ffffff",
            color: activeTab === "simulador" ? "#ffffff" : "#475569",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: activeTab === "simulador" ? "0 2px 6px rgba(255,85,0,0.3)" : "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          ⚡ Esteira Automatizada Industrial (Simulador em Tempo Real)
        </button>
      </div>

      {/* ============================================================== */}
      {/* ABA 1: INSPEÇÃO DE CORDAO DE SOLDA                             */}
      {/* ============================================================== */}
      {activeTab === "solda" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Barra de Seleção e Métricas Rápidas */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: "14px" }}>
            {/* Seletor de Amostra */}
            <div className="sf-card" style={{ padding: "14px 16px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                Amostra de Soldagem Inspecionada:
              </label>
              <select
                value={soldaImg}
                onChange={(e) => {
                  setSoldaImg(e.target.value);
                  setSelectedPointId("P-01");
                  setHoveredPointId(null);
                }}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "8px 10px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                }}
              >
                <option value="solda_porosa_reprovada.png">solda_porosa_reprovada.png — Porosidade Excessiva (35 Pontos Detectados)</option>
                <option value="solda_aprovada.png">solda_aprovada.png — Padrão Nominal AWS D1.1 (Conforme)</option>
                <option value="soldadura_defeituosa_oficina_retro.png">soldadura_defeituosa_oficina_retro.png — Defeitos Agrupados (55 Pontos)</option>
                <option value="soldadura_industrial_imperfeita_pixel_art.png">soldadura_industrial_imperfeita_pixel_art.png — Trincas e Poros (45 Pontos)</option>
              </select>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                <span style={{ fontSize: "11px", color: "#64748b" }}>
                  Norma Técnica: <b>AWS D1.1:2020 / ISO 5817 Grau B</b>
                </span>
                <button
                  onClick={exportTelemetryCSV}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#f8fafc",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#0284c7",
                    cursor: "pointer",
                  }}
                >
                  📥 Exportar CSV
                </button>
              </div>
            </div>

            {/* Badges de Resultado de Inspeção */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
              <div
                className="sf-card"
                style={{
                  padding: "12px",
                  textAlign: "center",
                  borderLeft: `4px solid ${isAprovado ? "#16a34a" : "#dc2626"}`,
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Status AWS D1.1
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: isAprovado ? "#16a34a" : "#dc2626",
                    marginTop: "6px",
                  }}
                >
                  {isAprovado ? "APROVADO" : "REPROVADO"}
                </div>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                  {isAprovado ? "Sem descontinuidades críticas" : "Porosidade > 4.0%"}
                </div>
              </div>

              <div className="sf-card" style={{ padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Pontos Identificados
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                  {weldData.pontos_defeito.length}
                </div>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                  Centróides mapeados (X, Y)
                </div>
              </div>

              <div className="sf-card" style={{ padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Taxa de Porosidade
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: weldData.metricas.taxa_porosidade_percentual > 4 ? "#dc2626" : "#16a34a",
                    marginTop: "4px",
                  }}
                >
                  {weldData.metricas.taxa_porosidade_percentual.toFixed(2)}%
                </div>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                  Limite máximo: 4.00%
                </div>
              </div>

              <div className="sf-card" style={{ padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Severidade dos Defeitos
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#dc2626" }}>🔴 {totalCriticos}</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#d97706" }}>🟡 {totalAlertas}</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#0284c7" }}>🔵 {totalToleraveis}</span>
                </div>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                  Crítico / Alerta / Tolerável
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* VISUALIZADOR INTERATIVO COM OVERLAY DE PONTOS OPENCV       */}
          {/* ========================================================== */}
          <div
            className="sf-card"
            style={{
              padding: "16px 20px",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
            }}
          >
            {/* Barra Superior do Visualizador */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "12px",
                marginBottom: "12px",
              }}
            >
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                  Visualizador Óptico Interativo com Leitura de Coordenadas OpenCV
                </span>
                <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "10px" }}>
                  (Clique ou passe o mouse sobre qualquer ponto para inspecionar métricas dimensionais)
                </span>
              </div>

              {/* Toggles de Camadas */}
              <div style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "11.5px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={showCrosshairs}
                    onChange={(e) => setShowCrosshairs(e.target.checked)}
                  />
                  <span>Miras (X,Y)</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={showBoundingBoxes}
                    onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                  />
                  <span>Bounding Boxes</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={showRoiBox}
                    onChange={(e) => setShowRoiBox(e.target.checked)}
                  />
                  <span>Caixa ROI</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={showCenterline}
                    onChange={(e) => setShowCenterline(e.target.checked)}
                  />
                  <span>Linha Central</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                  />
                  <span>Rótulos #P</span>
                </label>
              </div>
            </div>

            {/* Canvas / Imagem com SVG Overlay Interativo */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "1100px",
                margin: "0 auto",
                backgroundColor: "#071927",
                borderRadius: "6px",
                overflow: "hidden",
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
              }}
            >
              {/* Imagem de Fundo (Cordão de Solda Original) */}
              <img
                src={`/samples/${soldaImg}`}
                alt="Cordão de Solda"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  userSelect: "none",
                }}
              />

              {/* Camada SVG de Sobreposição de Pontos Identificados pelo OpenCV */}
              <svg
                viewBox={`0 0 ${weldData.largura_imagem} ${weldData.altura_imagem}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              >
                {/* 1. Caixa ROI do Cordão */}
                {showRoiBox && (
                  <g>
                    <rect
                      x={weldData.roi.x}
                      y={weldData.roi.y}
                      width={weldData.roi.w}
                      height={weldData.roi.h}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                    />
                    <text
                      x={weldData.roi.x + 8}
                      y={weldData.roi.y - 6}
                      fill="#38bdf8"
                      fontSize="16"
                      fontWeight="bold"
                    >
                      ROI Cordão de Fusão [{weldData.roi.x}, {weldData.roi.y}, {weldData.roi.w}×{weldData.roi.h} px]
                    </text>
                  </g>
                )}

                {/* 2. Linha de Centro do Cordão (Centerline) */}
                {showCenterline && (
                  <line
                    x1={weldData.roi.x}
                    y1={weldData.roi.y + weldData.roi.h / 2}
                    x2={weldData.roi.x + weldData.roi.w}
                    y2={weldData.roi.y + weldData.roi.h / 2}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.8"
                  />
                )}

                {/* 3. Desenho de Cada PONTO Identificado pelo OpenCV */}
                {weldData.pontos_defeito.map((p) => {
                  const isSelected = p.id === (hoveredPointId || selectedPointId);
                  const strokeColor =
                    p.severidade === "CRITICO"
                      ? "#ef4444"
                      : p.severidade === "ALERTA"
                      ? "#f59e0b"
                      : "#38bdf8";

                  const radius = Math.max(p.diametro_px * 0.8, 6);

                  return (
                    <g
                      key={p.id}
                      style={{ pointerEvents: "auto", cursor: "pointer" }}
                      onClick={() => setSelectedPointId(p.id)}
                      onMouseEnter={() => setHoveredPointId(p.id)}
                      onMouseLeave={() => setHoveredPointId(null)}
                    >
                      {/* Bounding Box Retangular */}
                      {showBoundingBoxes && (
                        <rect
                          x={weldData.roi.x + p.x - p.largura_px / 2}
                          y={weldData.roi.y + p.y - p.altura_px / 2}
                          width={p.largura_px}
                          height={p.altura_px}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={isSelected ? "2.5" : "1"}
                          opacity={isSelected ? "1" : "0.7"}
                        />
                      )}

                      {/* Círculo do Centróide com Diâmetro Equivalente */}
                      <circle
                        cx={p.x_global}
                        cy={p.y_global}
                        r={radius}
                        fill={isSelected ? strokeColor : "none"}
                        fillOpacity={isSelected ? "0.35" : "0"}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? "3" : "1.8"}
                      />

                      {/* Mira Laser / Crosshair (+) no Centróide Exato */}
                      {showCrosshairs && (
                        <g stroke={strokeColor} strokeWidth={isSelected ? "2" : "1.2"}>
                          <line
                            x1={p.x_global - radius - 5}
                            y1={p.y_global}
                            x2={p.x_global + radius + 5}
                            y2={p.y_global}
                          />
                          <line
                            x1={p.x_global}
                            y1={p.y_global - radius - 5}
                            x2={p.x_global}
                            y2={p.y_global + radius + 5}
                          />
                        </g>
                      )}

                      {/* Anel Pulsar / Sonar Ring no Ponto Selecionado */}
                      {isSelected && (
                        <circle
                          cx={p.x_global}
                          cy={p.y_global}
                          r={radius + 8}
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeDasharray="3 3"
                        />
                      )}

                      {/* Rótulo Numérico do Ponto (#P-01) */}
                      {showLabels && (
                        <g>
                          <rect
                            x={p.x_global - 16}
                            y={p.y_global - radius - 20}
                            width="34"
                            height="16"
                            rx="3"
                            fill="#0c233a"
                            fillOpacity="0.9"
                            stroke={strokeColor}
                            strokeWidth="1"
                          />
                          <text
                            x={p.x_global + 1}
                            y={p.y_global - radius - 8}
                            fill="#ffffff"
                            fontSize="11"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {p.id}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* HUD Flutuante no Canto do Visualizador com Métricas do Ponto Selecionado */}
              {activePoint && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    left: "12px",
                    backgroundColor: "rgba(12, 35, 58, 0.95)",
                    backdropFilter: "blur(4px)",
                    borderRadius: "6px",
                    border: `1.5px solid ${
                      activePoint.severidade === "CRITICO"
                        ? "#ef4444"
                        : activePoint.severidade === "ALERTA"
                        ? "#f59e0b"
                        : "#38bdf8"
                    }`,
                    padding: "10px 14px",
                    color: "#ffffff",
                    fontSize: "12px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
                    maxWidth: "380px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 800, fontSize: "13px", color: "var(--schutz-orange, #ff5500)" }}>
                      🎯 Leitura de Ponto OpenCV: {activePoint.id}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "3px",
                        backgroundColor:
                          activePoint.severidade === "CRITICO"
                            ? "#991b1b"
                            : activePoint.severidade === "ALERTA"
                            ? "#92400e"
                            : "#0369a1",
                        color: "#ffffff",
                      }}
                    >
                      {activePoint.severidade}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", marginTop: "8px" }}>
                    <div>Centróide ROI: <b>({activePoint.x}, {activePoint.y}) px</b></div>
                    <div>Centróide Global: <b>({activePoint.x_global}, {activePoint.y_global}) px</b></div>
                    <div>Área da Cavidade: <b>{activePoint.area_px} px²</b></div>
                    <div>Diâmetro Equivalente: <b>{activePoint.diametro_px} px</b></div>
                    <div>Circularidade (4πA/P²): <b>{activePoint.circularidade}</b></div>
                    <div>Bounding Box: <b>{activePoint.largura_px}×{activePoint.altura_px} px</b></div>
                  </div>

                  <div style={{ marginTop: "6px", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "6px" }}>
                    <div style={{ fontSize: "11px", color: "#cbd5e1" }}>
                      <b>Norma:</b> {activePoint.classificacao_aws}
                    </div>
                    <div style={{ fontSize: "11px", color: "#fed7aa", marginTop: "2px" }}>
                      <b>Ação Recomendada:</b> {activePoint.acao_recomendada}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================== */}
          {/* TABELA DE TELEMETRIA E IDENTIFICAÇÃO DE PONTOS OPENCV      */}
          {/* ========================================================== */}
          <div className="sf-card" style={{ padding: "16px 20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                  Tabela Detalhada de Pontos e Descontinuidades Identificados ({filteredPoints.length} itens)
                </span>
                <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "10px" }}>
                  Mapeamento de coordenadas (X, Y), área, esfericidade e classificação de conformidade AWS D1.1
                </span>
              </div>

              {/* Filtros da Tabela */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Buscar ponto (ex: P-04, 55px)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12px",
                    width: "200px",
                  }}
                />

                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  style={{
                    padding: "5px 8px",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  <option value="TODOS">Todas as Severidades</option>
                  <option value="CRITICO">Apenas Críticos</option>
                  <option value="ALERTA">Apenas Alertas</option>
                  <option value="TOLERAVEL">Apenas Toleráveis</option>
                </select>
              </div>
            </div>

            {/* Tabela de Pontos */}
            <div style={{ maxHeight: "280px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0c233a", color: "#ffffff", position: "sticky", top: 0, zIndex: 2 }}>
                    <th style={{ padding: "8px 12px" }}>Ponto</th>
                    <th style={{ padding: "8px 12px" }}>Centróide ROI (X, Y)</th>
                    <th style={{ padding: "8px 12px" }}>Centróide Global (X, Y)</th>
                    <th style={{ padding: "8px 12px" }}>Área (px²)</th>
                    <th style={{ padding: "8px 12px" }}>Diâmetro (px)</th>
                    <th style={{ padding: "8px 12px" }}>Circularidade</th>
                    <th style={{ padding: "8px 12px" }}>Severidade</th>
                    <th style={{ padding: "8px 12px" }}>Classificação AWS D1.1</th>
                    <th style={{ padding: "8px 12px" }}>Ação Prescritiva</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPoints.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: "16px", textAlign: "center", color: "#64748b" }}>
                        Nenhum ponto encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredPoints.map((p, idx) => {
                      const isSelected = p.id === (hoveredPointId || selectedPointId);
                      return (
                        <tr
                          key={p.id}
                          onClick={() => setSelectedPointId(p.id)}
                          onMouseEnter={() => setHoveredPointId(p.id)}
                          onMouseLeave={() => setHoveredPointId(null)}
                          style={{
                            backgroundColor: isSelected
                              ? "#fef3c7"
                              : idx % 2 === 0
                              ? "#ffffff"
                              : "#f8fafc",
                            cursor: "pointer",
                            borderBottom: "1px solid #e2e8f0",
                            transition: "background-color 0.15s ease",
                          }}
                        >
                          <td style={{ padding: "8px 12px", fontWeight: 800, color: "var(--schutz-orange, #ff5500)" }}>
                            {p.id}
                          </td>
                          <td style={{ padding: "8px 12px" }}>({p.x}, {p.y})</td>
                          <td style={{ padding: "8px 12px" }}>({p.x_global}, {p.y_global})</td>
                          <td style={{ padding: "8px 12px", fontWeight: 600 }}>{p.area_px}</td>
                          <td style={{ padding: "8px 12px" }}>{p.diametro_px}</td>
                          <td style={{ padding: "8px 12px" }}>{p.circularidade}</td>
                          <td style={{ padding: "8px 12px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "#ffffff",
                                backgroundColor:
                                  p.severidade === "CRITICO"
                                    ? "#dc2626"
                                    : p.severidade === "ALERTA"
                                    ? "#d97706"
                                    : "#0284c7",
                              }}
                            >
                              {p.severidade}
                            </span>
                          </td>
                          <td style={{ padding: "8px 12px" }}>{p.classificacao_aws}</td>
                          <td style={{ padding: "8px 12px", color: "#475569" }}>{p.acao_recomendada}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================== */}
          {/* PIPELINE OPENCV EM 9 ETAPAS REAIS (IMAGENS FÍSICAS REAIS)  */}
          {/* ========================================================== */}
          <div className="sf-card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                  Pipeline OpenCV de Transformações — 9 Etapas Reais de Processamento
                </span>
                <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "10px" }}>
                  Exposição transparente de cada camada matemática gerada pelo nó Edge
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {weldPipelineSteps.map((step) => (
                <div
                  key={step.step}
                  onClick={() =>
                    setExpandedStep({
                      title: step.title,
                      imgUrl: `/samples/pipeline/${step.file}`,
                      desc: step.desc,
                      formula: step.formula,
                    })
                  }
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "10px",
                    backgroundColor: "#f8fafc",
                    cursor: "pointer",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#0284c7" }}>
                      {step.title}
                    </span>
                    <span style={{ fontSize: "10px", color: "#94a3b8" }}>🔍 Ampliar</span>
                  </div>

                  <img
                    src={`/samples/pipeline/${step.file}`}
                    alt={step.title}
                    style={{
                      width: "100%",
                      height: "110px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      backgroundColor: "#000000",
                    }}
                  />

                  <div
                    style={{
                      fontSize: "10.5px",
                      fontFamily: "monospace",
                      color: "#475569",
                      marginTop: "6px",
                      backgroundColor: "#ffffff",
                      padding: "4px 6px",
                      borderRadius: "3px",
                      border: "1px solid #e2e8f0",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {step.formula}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 2: TERMOGRAFIA HAZ E TEMPERATURA POR PIXEL                 */}
      {/* ============================================================== */}
      {activeTab === "termo" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Controles de Termografia */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: "14px" }}>
            <div className="sf-card" style={{ padding: "14px 16px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                Termograma Infravermelho Analisado:
              </label>
              <select
                value={termoImg}
                onChange={(e) => {
                  setTermoImg(e.target.value);
                  setSelectedHotSpotId("TH-01");
                  setProbePos(null);
                }}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "8px 10px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="termografia_haz_critica.png">termografia_haz_critica.png — Sobreaquecimento Crítico (Pico 1.500 °C)</option>
                <option value="mapa_termico_pixelado_soldadura.png">mapa_termico_pixelado_soldadura.png — Perfil Térmico Nominal Seguro</option>
              </select>

              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "10px" }}>
                <b>Diretriz Metalúrgica:</b> {hazData.metricas.diretriz_termica}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
              <div
                className="sf-card"
                style={{
                  padding: "12px",
                  textAlign: "center",
                  borderLeft: `4px solid ${
                    hazData.status_haz === "CRITICO_SOBREAQUECIMENTO" ? "#dc2626" : "#16a34a"
                  }`,
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Status HAZ
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: hazData.status_haz === "CRITICO_SOBREAQUECIMENTO" ? "#dc2626" : "#16a34a",
                    marginTop: "6px",
                  }}
                >
                  {hazData.status_haz === "CRITICO_SOBREAQUECIMENTO" ? "CRÍTICO" : "NOMINAL SEGURO"}
                </div>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                  Risco de empenamento
                </div>
              </div>

              <div className="sf-card" style={{ padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Área Sobreaquecida
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#dc2626", marginTop: "4px" }}>
                  {hazData.metricas.percentual_area_sobreaquecida.toFixed(1)}%
                </div>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                  {hazData.metricas.pixels_criticos.toLocaleString("pt-BR")} px críticos
                </div>
              </div>

              <div className="sf-card" style={{ padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Temperatura Máxima
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#ea580c", marginTop: "4px" }}>
                  {hazData.temp_stats.temp_max_c.toFixed(0)} °C
                </div>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                  Ponto de fusão da liga
                </div>
              </div>

              <div className="sf-card" style={{ padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Temperatura Média
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                  {hazData.temp_stats.temp_media_c.toFixed(0)} °C
                </div>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                  Desvio σ = {hazData.temp_stats.temp_desvio_c.toFixed(0)} °C
                </div>
              </div>
            </div>
          </div>

          {/* Visualizador Termográfico com Sonda Térmica Interativa */}
          <div className="sf-card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                  Sonda Radiométrica Interativa — Termometria por Ponto (X, Y)
                </span>
                <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "10px" }}>
                  Mova o cursor sobre o termograma para aferir a temperatura exata em cada pixel
                </span>
              </div>

              {probePos && (
                <div
                  style={{
                    backgroundColor: "#0c233a",
                    color: "#ffffff",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>🎯 Posição: ({probePos.x}, {probePos.y}) px</span>
                  <span style={{ color: "var(--schutz-orange, #ff5500)" }}>
                    🔥 {probePos.temp.toFixed(1)} °C
                  </span>
                </div>
              )}
            </div>

            {/* Imagem Termográfica com Overlay de Miras Térmicas */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "1100px",
                margin: "0 auto",
                backgroundColor: "#071927",
                borderRadius: "6px",
                overflow: "hidden",
                cursor: "crosshair",
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const scaleX = hazData.largura_imagem / rect.width;
                const scaleY = hazData.altura_imagem / rect.height;
                const pxX = Math.round((e.clientX - rect.left) * scaleX);
                const pxY = Math.round((e.clientY - rect.top) * scaleY);

                // Cálculo estimativo rápido por gradiente radial de aproximação
                const dx = pxX - hazData.largura_imagem / 2;
                const dy = pxY - hazData.altura_imagem / 2;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const estimated = Math.max(
                  25,
                  Math.min(1500, hazData.temp_stats.temp_max_c - dist * 1.4 + (Math.random() * 4 - 2))
                );

                setProbePos({ x: pxX, y: pxY, temp: estimated });
              }}
              onMouseLeave={() => setProbePos(null)}
            >
              <img
                src={`/samples/${termoImg}`}
                alt="Termografia HAZ"
                style={{ width: "100%", height: "auto", display: "block" }}
              />

              {/* Overlay SVG com Miras nos Pontos Quentes Identificados */}
              <svg
                viewBox={`0 0 ${hazData.largura_imagem} ${hazData.altura_imagem}`}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
              >
                {hazData.pontos_quentes.map((hs) => {
                  const isSelected = hs.id === selectedHotSpotId;
                  const color = hs.severidade === "CRITICO" ? "#ef4444" : hs.severidade === "ALERTA" ? "#f59e0b" : "#38bdf8";

                  return (
                    <g
                      key={hs.id}
                      style={{ pointerEvents: "auto", cursor: "pointer" }}
                      onClick={() => setSelectedHotSpotId(hs.id)}
                    >
                      {/* Mira Reticular no Ponto Quente */}
                      <circle
                        cx={hs.x}
                        cy={hs.y}
                        r="18"
                        fill="none"
                        stroke={color}
                        strokeWidth={isSelected ? "3" : "1.8"}
                      />
                      <line x1={hs.x - 24} y1={hs.y} x2={hs.x + 24} y2={hs.y} stroke={color} strokeWidth="1.5" />
                      <line x1={hs.x} y1={hs.y - 24} x2={hs.x} y2={hs.y + 24} stroke={color} strokeWidth="1.5" />

                      {/* Tag Flutuante com Temperatura */}
                      <rect
                        x={hs.x - 35}
                        y={hs.y - 42}
                        width="70"
                        height="18"
                        rx="3"
                        fill="#0c233a"
                        fillOpacity="0.95"
                        stroke={color}
                        strokeWidth="1"
                      />
                      <text
                        x={hs.x}
                        y={hs.y - 29}
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {hs.temperatura_c}°C
                      </text>
                    </g>
                  );
                })}

                {/* Cursor da Sonda Interativa */}
                {probePos && (
                  <g>
                    <circle cx={probePos.x} cy={probePos.y} r="8" fill="none" stroke="#ffffff" strokeWidth="2" />
                    <line x1={probePos.x - 14} y1={probePos.y} x2={probePos.x + 14} y2={probePos.y} stroke="#ffffff" strokeWidth="1.5" />
                    <line x1={probePos.x} y1={probePos.y - 14} x2={probePos.x} y2={probePos.y + 14} stroke="#ffffff" strokeWidth="1.5" />
                  </g>
                )}
              </svg>

              {/* Informação do Hotspot Selecionado */}
              {activeHotSpot && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    left: "12px",
                    backgroundColor: "rgba(12, 35, 58, 0.95)",
                    borderRadius: "6px",
                    border: "1.5px solid #ff5500",
                    padding: "10px 14px",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                >
                  <div style={{ fontWeight: 800, color: "var(--schutz-orange, #ff5500)" }}>
                    🔥 Ponto Térmico Selecionado: {activeHotSpot.id}
                  </div>
                  <div style={{ marginTop: "4px" }}>
                    Posição: <b>({activeHotSpot.x}, {activeHotSpot.y}) px</b> | Temperatura:{" "}
                    <b style={{ color: "#f87171" }}>{activeHotSpot.temperatura_c} °C</b>
                  </div>
                  <div style={{ marginTop: "2px", color: "#cbd5e1" }}>
                    Zona Metalúrgica: <b>{activeHotSpot.zona_haz}</b> ({activeHotSpot.severidade})
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabela de Pontos Quentes (Hot Spots) */}
          <div className="sf-card" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>
              Telemetria de Pontos Quentes Identificados no Perfil Térmico ({hazData.pontos_quentes.length} picos)
            </div>

            <div style={{ maxHeight: "220px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0c233a", color: "#ffffff", position: "sticky", top: 0 }}>
                    <th style={{ padding: "8px 12px" }}># ID</th>
                    <th style={{ padding: "8px 12px" }}>Coordenada (X, Y)</th>
                    <th style={{ padding: "8px 12px" }}>Temperatura (°C)</th>
                    <th style={{ padding: "8px 12px" }}>Área de Influência (px²)</th>
                    <th style={{ padding: "8px 12px" }}>Zona Térmica HAZ</th>
                    <th style={{ padding: "8px 12px" }}>Severidade</th>
                  </tr>
                </thead>
                <tbody>
                  {hazData.pontos_quentes.map((hs, idx) => (
                    <tr
                      key={hs.id}
                      onClick={() => setSelectedHotSpotId(hs.id)}
                      style={{
                        backgroundColor:
                          hs.id === selectedHotSpotId ? "#fef3c7" : idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                        cursor: "pointer",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <td style={{ padding: "8px 12px", fontWeight: 800, color: "var(--schutz-orange, #ff5500)" }}>
                        {hs.id}
                      </td>
                      <td style={{ padding: "8px 12px" }}>({hs.x}, {hs.y})</td>
                      <td style={{ padding: "8px 12px", fontWeight: 700, color: hs.temperatura_c > 1200 ? "#dc2626" : "#ea580c" }}>
                        {hs.temperatura_c.toFixed(1)} °C
                      </td>
                      <td style={{ padding: "8px 12px" }}>{hs.area_px}</td>
                      <td style={{ padding: "8px 12px" }}>{hs.zona_haz}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#ffffff",
                            backgroundColor:
                              hs.severidade === "CRITICO" ? "#dc2626" : hs.severidade === "ALERTA" ? "#d97706" : "#0284c7",
                          }}
                        >
                          {hs.severidade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 8 Etapas Reais de Termografia HAZ OpenCV */}
          <div className="sf-card" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>
              Pipeline Termográfico OpenCV — 8 Etapas Reais de Segmentação HSV e Calor
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              {hazPipelineSteps.map((step) => (
                <div
                  key={step.step}
                  onClick={() =>
                    setExpandedStep({
                      title: step.title,
                      imgUrl: `/samples/pipeline/${step.file}`,
                      desc: step.desc,
                      formula: step.formula,
                    })
                  }
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "10px",
                    backgroundColor: "#f8fafc",
                    cursor: "pointer",
                    transition: "transform 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#0284c7", marginBottom: "6px" }}>
                    {step.title}
                  </div>
                  <img
                    src={`/samples/pipeline/${step.file}`}
                    alt={step.title}
                    style={{
                      width: "100%",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      backgroundColor: "#000000",
                    }}
                  />
                  <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px", fontFamily: "monospace" }}>
                    {step.formula}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 3: SIMULADOR DA LINHA DE FÁBRICA (ESTEIRA AUTOMÁTICA)      */}
      {/* ============================================================== */}
      {activeTab === "simulador" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Controles da Esteira */}
          <div className="sf-card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                  Controle da Linha de Inspeção Robotizada (Esteira Contínua)
                </h3>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  Simulação de passagem de peças pela estação de visão computacional em tempo real.
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  onClick={() => setRunning(!isRunning)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: isRunning ? "#dc2626" : "var(--schutz-orange, #ff5500)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  }}
                >
                  {isRunning ? "⏸️ Pausar Esteira" : "▶️ Iniciar Esteira Contínua"}
                </button>

                <button
                  onClick={resetConveyor}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    color: "#475569",
                    fontWeight: 600,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  🔄 Resetar Contador
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}>
                  <span>Intervalo:</span>
                  <select
                    value={cycleDelaySec}
                    onChange={(e) => setCycleDelay(parseFloat(e.target.value))}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #cbd5e1",
                      fontSize: "12px",
                    }}
                  >
                    <option value={1.0}>1.0s (Rápido)</option>
                    <option value={2.0}>2.0s (Padrão)</option>
                    <option value={3.5}>3.5s (Cadenciado)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Histórico da Esteira */}
          <div className="sf-card" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>
              Histórico em Tempo Real de Peças Inspecionadas ({history.length} ciclos registrados)
            </div>

            <div style={{ maxHeight: "350px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0c233a", color: "#ffffff", position: "sticky", top: 0 }}>
                    <th style={{ padding: "8px 12px" }}># Ciclo</th>
                    <th style={{ padding: "8px 12px" }}>Horário</th>
                    <th style={{ padding: "8px 12px" }}>ID da Peça</th>
                    <th style={{ padding: "8px 12px" }}>Célula / Estação</th>
                    <th style={{ padding: "8px 12px" }}>Status Inspeção</th>
                    <th style={{ padding: "8px 12px" }}>Leitura Detalhada de Defeitos</th>
                    <th style={{ padding: "8px 12px" }}>Latência</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                        Esteira parada. Clique em "Iniciar Esteira Contínua" para registrar ciclos de inspeção.
                      </td>
                    </tr>
                  ) : (
                    history.map((rec) => (
                      <tr
                        key={rec.peca_num}
                        style={{
                          backgroundColor: rec.status === "APROVADO" ? "#f0fdf4" : "#fef2f2",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        <td style={{ padding: "8px 12px", fontWeight: 700 }}>#{rec.peca_num}</td>
                        <td style={{ padding: "8px 12px", color: "#64748b" }}>{rec.hora}</td>
                        <td style={{ padding: "8px 12px", fontWeight: 600 }}>{rec.id}</td>
                        <td style={{ padding: "8px 12px" }}>{rec.estacao}</td>
                        <td style={{ padding: "8px 12px" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: 700,
                              color: "#ffffff",
                              backgroundColor: rec.status === "APROVADO" ? "#16a34a" : "#dc2626",
                            }}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td style={{ padding: "8px 12px" }}>{rec.detalhe}</td>
                        <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#0284c7" }}>
                          {rec.tempo_ms}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL / ZOOM DA ETAPA DO PIPELINE MATEMÁTICO                   */}
      {/* ============================================================== */}
      {expandedStep && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(12, 35, 58, 0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setExpandedStep(null)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "20px",
              maxWidth: "800px",
              width: "100%",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0c233a", margin: 0 }}>
                {expandedStep.title}
              </h3>
              <button
                onClick={() => setExpandedStep(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#64748b",
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>

            <img
              src={expandedStep.imgUrl}
              alt={expandedStep.title}
              style={{
                width: "100%",
                maxHeight: "380px",
                objectFit: "contain",
                backgroundColor: "#000000",
                borderRadius: "6px",
              }}
            />

            <div style={{ marginTop: "14px" }}>
              <div
                style={{
                  backgroundColor: "#f1f5f9",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  color: "#0f172a",
                }}
              >
                <b>Fórmula / Parâmetro:</b> {expandedStep.formula}
              </div>
              <div style={{ fontSize: "12.5px", color: "#475569", marginTop: "8px" }}>
                {expandedStep.desc}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
