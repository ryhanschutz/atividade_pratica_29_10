// src/features/visao-computacional/stores/useConveyorStore.ts
import { create } from "zustand";

export interface ConveyorPieceItem {
  id_tipo: string;
  nome: string;
  arquivo: string;
  tipo_teste: "solda" | "termo";
  estacao: string;
}

export const FABRICA_CATALOGO: ConveyorPieceItem[] = [
  {
    id_tipo: "PEÇA-OK-A1",
    nome: "Chapa Soldada MIG Nominal",
    arquivo: "solda_aprovada.png",
    tipo_teste: "solda",
    estacao: "Célula CEL-201 (Braço Solda #1)",
  },
  {
    id_tipo: "PEÇA-DEF-P2",
    nome: "Junta com Porosidade Excessiva",
    arquivo: "solda_porosa_reprovada.png",
    tipo_teste: "solda",
    estacao: "Célula CEL-201 (Braço Solda #1)",
  },
  {
    id_tipo: "PEÇA-DEF-RETRO",
    nome: "Soldagem Descontínua c/ Trincas",
    arquivo: "soldadura_defeituosa_oficina_retro.png",
    tipo_teste: "solda",
    estacao: "Célula CEL-202 (Braço Solda #2)",
  },
  {
    id_tipo: "PEÇA-DEF-PIXEL",
    nome: "Cordão Imperfeito — Poros Críticos",
    arquivo: "soldadura_industrial_imperfeita_pixel_art.png",
    tipo_teste: "solda",
    estacao: "Célula CEL-203 (Inspeção Robótica)",
  },
  {
    id_tipo: "PEÇA-HAZ-CRIT",
    nome: "Zona Térmica HAZ — Sobreaquecida",
    arquivo: "termografia_haz_critica.png",
    tipo_teste: "termo",
    estacao: "Célula CEL-204 (Monitor Termográfico)",
  },
  {
    id_tipo: "PEÇA-HAZ-MAP",
    nome: "Mapeamento Térmico Gradiente",
    arquivo: "mapa_termico_pixelado_soldadura.png",
    tipo_teste: "termo",
    estacao: "Célula CEL-204 (Câmera Térmica IR)",
  },
];

export interface ConveyorHistoryRecord {
  peca_num: number;
  id: string;
  nome: string;
  estacao: string;
  status: "APROVADO" | "REPROVADO";
  detalhe: string;
  tempo_ms: string;
  hora: string;
}

interface ConveyorState {
  isRunning: boolean;
  cycleDelaySec: number;
  history: ConveyorHistoryRecord[];
  pieceCount: number;
  currentIndex: number;
  currentPiece: ConveyorPieceItem;
  setRunning: (running: boolean) => void;
  setCycleDelay: (delay: number) => void;
  resetConveyor: () => void;
  nextStep: () => void;
}

export const useConveyorStore = create<ConveyorState>((set, get) => ({
  isRunning: false,
  cycleDelaySec: 2.0,
  history: [],
  pieceCount: 0,
  currentIndex: 0,
  currentPiece: FABRICA_CATALOGO[0],

  setRunning: (running) => set({ isRunning: running }),
  setCycleDelay: (delay) => set({ cycleDelaySec: delay }),

  resetConveyor: () =>
    set({
      isRunning: false,
      history: [],
      pieceCount: 0,
      currentIndex: 0,
      currentPiece: FABRICA_CATALOGO[0],
    }),

  nextStep: () => {
    const { currentIndex, pieceCount, history } = get();
    const nextIdx = (currentIndex + 1) % FABRICA_CATALOGO.length;
    const item = FABRICA_CATALOGO[nextIdx];
    const newCount = pieceCount + 1;

    const isAprovado = item.id_tipo === "PEÇA-OK-A1" || item.id_tipo === "PEÇA-HAZ-MAP";
    const status = isAprovado ? "APROVADO" : "REPROVADO";
    const detalhe =
      item.tipo_teste === "solda"
        ? isAprovado
          ? "Poros: 0 | Taxa: 0.12% | Norma AWS D1.1 Aprovado"
          : "Poros: 14 | Taxa: 4.85% | Reprovado por Porosidade Excessiva"
        : isAprovado
        ? "Temp Máx: 720°C | Área Crítica: 0.00% | Perfil Nominal Seguro"
        : "Temp Máx: 1480°C | Área Crítica: 22.40% | Sobreaquecimento Crítico";

    const latency = (Math.random() * 8 + 14).toFixed(1);
    const now = new Date().toLocaleTimeString("pt-BR");

    const newRecord: ConveyorHistoryRecord = {
      peca_num: newCount,
      id: item.id_tipo,
      nome: item.nome,
      estacao: item.estacao,
      status,
      detalhe,
      tempo_ms: `${latency} ms`,
      hora: now,
    };

    set({
      currentIndex: nextIdx,
      pieceCount: newCount,
      currentPiece: item,
      history: [newRecord, ...history].slice(0, 50),
    });
  },
}));

