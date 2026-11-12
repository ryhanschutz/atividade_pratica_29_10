// src/components/layout/Navbar.tsx
import React from "react";

interface NavbarProps {
  currentModuleTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentModuleTitle = "Visão Geral",
}) => {
  return (
    <header
      style={{
        height: "54px",
        backgroundColor: "var(--sf-header-bg, #0c233a)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        color: "var(--sf-header-text, #ffffff)",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
        borderBottom: "2px solid var(--schutz-orange, #ff5500)",
        zIndex: 50,
      }}
    >
      {/* Lado Esquerdo: Logo Oficial Schutz IGNITION + Módulo Ativo */}
      <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
        {/* Logo Oficial da Marca */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/logo-schutz-ignition.png"
            alt="Schutz IGNITION - OEE • BI"
            style={{
              height: "38px",
              objectFit: "contain",
              filter: "brightness(1.05)",
            }}
          />
        </div>

        {/* Separador Vertical */}
        <div style={{ width: "1px", height: "24px", backgroundColor: "#334e68" }} />

        {/* Indicador do Módulo Operacional em Português */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "10px", color: "var(--sf-header-subtext, #94a3b8)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Módulo Operacional
          </span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
            {currentModuleTitle}
          </span>
        </div>
      </div>

      {/* Lado Direito: Status Real da Conexão Industrial (Sem botões inúteis) */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Indicador de Status do Nó Edge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            padding: "5px 12px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 600,
            color: "#6ee7b7",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
              boxShadow: "0 0 6px #10b981",
            }}
          />
          Nó Edge Online • Células CEL-201 a CEL-204
        </div>
      </div>
    </header>
  );
};
