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
  home: "Home",
  operacao: "Operação e Inferência",
  visao: "Visão Computacional",
  saneamento: "Saneamento de Dados",
  saude: "Saúde do Nó Edge",
};

const DEFAULT_FILTERS: SmartFactoryFilterState = {
  dateRange: "4/15/2024 - 4/20/2024",
  operationType: "All",
  machine: "All",
  position: "All",
  product: "All",
  shiftName: "All",
  employee: "All",
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

  const handleSync = () => {
    // Feedback visual de sincronização e recálculo
    setFilters((prev) => ({ ...prev }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="sf-app-container">
      {/* 1. Header Superior Dark (Smart Factory) */}
      <Navbar currentModuleTitle={MODULE_TITLES[activeModule]} />

      {/* 2. Área Central com Barras Laterais e Conteúdo */}
      <div className="sf-main-layout">
        {/* Barra Vertical de Ícones (48px) */}
        <IconSidebar
          activeModule={activeModule}
          onSelectModule={(mod) => setActiveModule(mod)}
        />

        {/* Barra Lateral de Filtros (210px) */}
        <FilterSidebar
          filters={filters}
          onChangeFilter={handleChangeFilter}
          onSync={handleSync}
          onReset={handleReset}
        />

        {/* Viewport Principal do Módulo Ativo */}
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

