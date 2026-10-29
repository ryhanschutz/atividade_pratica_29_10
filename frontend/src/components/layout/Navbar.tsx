// src/components/layout/Navbar.tsx
import React from "react";
import { Bell } from "lucide-react";

interface NavbarProps {
  currentModuleTitle?: string;
  notificationCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentModuleTitle = "Home",
  notificationCount = 43,
}) => {
  return (
    <header
      style={{
        height: "48px",
        backgroundColor: "var(--sf-header-bg, #26384a)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        color: "var(--sf-header-text, #ffffff)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
        zIndex: 50,
      }}
    >
      {/* Lado Esquerdo: Logo Schutz Factory + Indicador de Módulo */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          {/* Ícone Geométrico Schutz Factory */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="20" height="18" rx="3" stroke="#38bdf8" strokeWidth="2.2" />
            <path d="M7 8H17M7 12H17M7 16H12" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.2px" }}>
              Schutz
            </span>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#38bdf8", textTransform: "uppercase" }}>
              Factory
            </span>
          </div>
        </div>

        {/* Indicador de Módulo / Breadcrumb */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "9px", color: "var(--sf-header-subtext, #94a3b8)", textTransform: "uppercase" }}>
            Module
          </span>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>
            {currentModuleTitle}
          </span>
        </div>
      </div>

      {/* Lado Direito: Notificações + Perfil do Usuário (Admin Available) */}
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        {/* Notificações com badge 43 */}
        <div style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Bell size={18} color="#cbd5e1" />
          <span
            style={{
              position: "absolute",
              top: "-6px",
              right: "-8px",
              backgroundColor: "var(--sf-header-badge-bg, #0284c7)",
              color: "#ffffff",
              fontSize: "9px",
              fontWeight: 700,
              padding: "1px 4px",
              borderRadius: "999px",
              border: "1.5px solid #26384a",
            }}
          >
            {notificationCount}
          </span>
        </div>

        {/* Usuário: Admin Available + Avatar com capacete industrial */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.1 }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>
              Admin
            </span>
            <span style={{ fontSize: "10px", color: "#38bdf8", fontWeight: 500 }}>
              Available
            </span>
          </div>

          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid #38bdf8",
              fontSize: "14px",
            }}
            title="Administrador da Fábrica"
          >
            👷
          </div>
        </div>
      </div>
    </header>
  );
};
