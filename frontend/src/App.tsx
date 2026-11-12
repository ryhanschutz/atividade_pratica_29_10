// src/App.tsx
import React, { useState } from "react";
import { Navbar } from "./components/layout/Navbar";
import { IconSidebar, ActiveModuleKey } from "./components/layout/IconSidebar";
import { FilterSidebar } from "./components/layout/FilterSidebar";
import { SmartFactoryDashboard } from "./features/smart-factory/components/SmartFactoryDashboard";
import { OperacaoInferenciaView } from "./features/operacao-inferencia/components/OperacaoInferenciaView";
import { VisaoComputacionalView } from "./features/visao-computacional/components/VisaoComputacionalView";
import { SaneamentoDadosView } from "./features/saneamento-dados/components/SaneamentoDadosView";
import { SaudeEdgeView } from "./features/saude-edge/components/SaudeEdgeView";
import { SmartFactoryFilterState } from "./features/smart-factory/types/smartFactory";

const MODULE_TITLES: Record<ActiveModuleKey, string> = {
  home: "Visão Geral OEE (Dashboard Executivo)",
  operacao: "Operação e Inferência CLP (Malha Fechada)",
  visao: "Visão Computacional & Simulador (AWS D1.1 e HAZ)",
  saneamento: "Saneamento de Dados (Filtro de Sensores)",
  saude: "Saúde do Nó Edge (Hardware & RandomForest)",
};

const DEFAULT_FILTERS: SmartFactoryFilterState = {
  periodo: "Amostragem IoT contínua (5 min)",
  idCelula: "TODAS",
  ligaMetalica: "TODAS",
  tipoFalha: "TODOS",
};

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModuleKey>("home");
  const [filters, setFilters] = useState<SmartFactoryFilterState>(DEFAULT_FILTERS);

  const handleChangeFilter = <K extends keyof SmartFactoryFilterState>(
    key: K,
    val: SmartFactoryFilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="sf-app-container">
      {/* 1. Header Superior com Logo Oficial Schutz IGNITION */}
      <Navbar currentModuleTitle={MODULE_TITLES[activeModule]} />

      {/* 2. Área Central com Barra Lateral de Módulos, Filtros e Conteúdo */}
      <div className="sf-main-layout">
        {/* Barra Vertical de Módulos Funcionais */}
        <IconSidebar
          activeModule={activeModule}
          onSelectModule={(mod) => setActiveModule(mod)}
        />

        {/* Barra Lateral de Filtros Operacionais do Parque Fabril */}
        <FilterSidebar
          filters={filters}
          onChangeFilter={handleChangeFilter}
        />

        {/* Conteúdo Principal do Módulo Ativo (100% em Português) */}
        <main className="sf-content-viewport">
          {activeModule === "home" && <SmartFactoryDashboard filters={filters} />}
          {activeModule === "operacao" && <OperacaoInferenciaView />}
          {activeModule === "visao" && <VisaoComputacionalView />}
          {activeModule === "saneamento" && <SaneamentoDadosView />}
          {activeModule === "saude" && <SaudeEdgeView />}
        </main>
      </div>
    </div>
  );
}
