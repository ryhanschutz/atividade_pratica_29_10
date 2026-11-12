// src/components/layout/IconSidebar.tsx
import React from "react";
import {
  LayoutDashboard,
  Factory,
  Camera,
  Database,
  Activity,
} from "lucide-react";

export type ActiveModuleKey =
  | "home"
  | "operacao"
  | "visao"
  | "saneamento"
  | "saude";

interface IconSidebarProps {
  activeModule: ActiveModuleKey;
  onSelectModule: (key: ActiveModuleKey) => void;
}

export const IconSidebar: React.FC<IconSidebarProps> = ({
  activeModule,
  onSelectModule,
}) => {
  // Apenas os ícones que possuem funcionalidade e telas reais conforme o PDF
  const navItems = [
    {
      key: "home",
      icon: LayoutDashboard,
      label: "Visão Geral OEE (Dashboard Executivo)",
      moduleKey: "home" as ActiveModuleKey,
    },
    {
      key: "operacao",
      icon: Factory,
      label: "Operação e Inferência CLP (Malha Fechada)",
      moduleKey: "operacao" as ActiveModuleKey,
    },
    {
      key: "visao",
      icon: Camera,
      label: "Visão Computacional & Simulador (Solda e HAZ)",
      moduleKey: "visao" as ActiveModuleKey,
    },
    {
      key: "saneamento",
      icon: Database,
      label: "Saneamento de Dados (Limpeza de Sensores)",
      moduleKey: "saneamento" as ActiveModuleKey,
    },
    {
      key: "saude",
      icon: Activity,
      label: "Saúde do Nó Edge (Hardware & Modelo)",
      moduleKey: "saude" as ActiveModuleKey,
    },
  ];

  return (
    <aside
      style={{
        width: "54px",
        backgroundColor: "var(--sf-nav-bg, #071927)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 0",
        gap: "12px",
        zIndex: 40,
        userSelect: "none",
        borderRight: "1px solid #163654",
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeModule === item.moduleKey;

        return (
          <button
            key={item.key}
            onClick={() => onSelectModule(item.moduleKey)}
            title={item.label}
            style={{
              width: "42px",
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isActive
                ? "var(--schutz-orange, #ff5500)"
                : "transparent",
              color: isActive ? "#ffffff" : "var(--sf-nav-icon, #94a3b8)",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              boxShadow: isActive ? "0 2px 8px rgba(255, 85, 0, 0.4)" : "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "var(--schutz-navy-light, #163654)";
                e.currentTarget.style.color = "#ffffff";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--sf-nav-icon, #94a3b8)";
              }
            }}
          >
            <Icon size={20} />
          </button>
        );
      })}
    </aside>
  );
};
