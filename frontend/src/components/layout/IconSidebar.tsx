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
  // Apenas os ícones que possuem funcionalidade e telas ativas no sistema
  const navItems = [
    {
      key: "home",
      icon: LayoutDashboard,
      label: "Schutz Factory (Home)",
      moduleKey: "home" as ActiveModuleKey,
    },
    {
      key: "operacao",
      icon: Factory,
      label: "Operação e Inferência",
      moduleKey: "operacao" as ActiveModuleKey,
    },
    {
      key: "visao",
      icon: Camera,
      label: "Visão Computacional & Simulador",
      moduleKey: "visao" as ActiveModuleKey,
    },
    {
      key: "saneamento",
      icon: Database,
      label: "Saneamento de Dados",
      moduleKey: "saneamento" as ActiveModuleKey,
    },
    {
      key: "saude",
      icon: Activity,
      label: "Saúde do Nó Edge",
      moduleKey: "saude" as ActiveModuleKey,
    },
  ];

  return (
    <aside
      style={{
        width: "52px",
        backgroundColor: "var(--sf-nav-bg, #1c2631)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 0",
        gap: "10px",
        zIndex: 40,
        userSelect: "none",
        borderRight: "1px solid #17202a",
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
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isActive
                ? "var(--sf-nav-active-bg, #0284c7)"
                : "transparent",
              color: isActive ? "#ffffff" : "var(--sf-nav-icon, #94a3b8)",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor =
                  "var(--sf-nav-hover-bg, #273747)";
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
