// src/components/layout/FilterSidebar.tsx
import React from "react";
import { Filter, ChevronDown } from "lucide-react";
import { SmartFactoryFilterState } from "../../features/smart-factory/types/smartFactory";

interface FilterSidebarProps {
  filters: SmartFactoryFilterState;
  onChangeFilter: <K extends keyof SmartFactoryFilterState>(
    key: K,
    val: SmartFactoryFilterState[K]
  ) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChangeFilter,
}) => {
  return (
    <div
      style={{
        width: "220px",
        backgroundColor: "var(--sf-filter-bg, #ffffff)",
        borderRight: "1px solid var(--sf-filter-border, #e2e8f0)",
        display: "flex",
        flexDirection: "column",
        padding: "16px 14px",
        gap: "14px",
        zIndex: 30,
        boxShadow: "1px 0 3px rgba(0,0,0,0.02)",
      }}
    >
      {/* Cabeçalho de Filtros Operacionais */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          paddingBottom: "10px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Filter size={15} color="var(--schutz-orange, #ff5500)" />
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--schutz-navy, #0c233a)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Filtros de Processo
        </span>
      </div>

      {/* 1. Campo: Célula de Manufatura (id_celula do PDF) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--schutz-navy, #0c233a)" }}>
          Célula de Manufatura
        </label>
        <div style={{ position: "relative" }}>
          <select
            value={filters.idCelula}
            onChange={(e) => onChangeFilter("idCelula", e.target.value)}
            style={{
              width: "100%",
              padding: "6px 24px 6px 8px",
              fontSize: "11.5px",
              borderRadius: "4px",
              border: "1px solid var(--sf-filter-input-border, #cbd5e1)",
              backgroundColor: "#ffffff",
              color: "#1e293b",
              appearance: "none",
              outline: "none",
              fontWeight: 500,
            }}
          >
            <option value="TODAS">Todas as Células (201-204)</option>
            <option value="CEL-201">CEL-201 (Braço Solda #1)</option>
            <option value="CEL-202">CEL-202 (Braço Solda #2)</option>
            <option value="CEL-203">CEL-203 (Inspeção Robótica)</option>
            <option value="CEL-204">CEL-204 (Câmara Térmica IR)</option>
          </select>
          <ChevronDown size={13} color="#64748b" style={{ position: "absolute", right: 8, top: 9, pointerEvents: "none" }} />
        </div>
      </div>

      {/* 2. Campo: Liga Metálica em Processamento (liga_metalica do PDF) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--schutz-navy, #0c233a)" }}>
          Liga Metálica
        </label>
        <div style={{ position: "relative" }}>
          <select
            value={filters.ligaMetalica}
            onChange={(e) => onChangeFilter("ligaMetalica", e.target.value)}
            style={{
              width: "100%",
              padding: "6px 24px 6px 8px",
              fontSize: "11.5px",
              borderRadius: "4px",
              border: "1px solid var(--sf-filter-input-border, #cbd5e1)",
              backgroundColor: "#ffffff",
              color: "#1e293b",
              appearance: "none",
              outline: "none",
              fontWeight: 500,
            }}
          >
            <option value="TODAS">Todas as Ligas</option>
            <option value="Liga_Titanio_Ti6Al4V">Liga Titânio (Ti6Al4V)</option>
            <option value="Aluminio_7075">Alumínio 7075 Aeroespacial</option>
            <option value="Aco_Carbono_316L">Aço Carbono 316L</option>
          </select>
          <ChevronDown size={13} color="#64748b" style={{ position: "absolute", right: 8, top: 9, pointerEvents: "none" }} />
        </div>
      </div>

      {/* 3. Campo: Estado / Alvo Preditivo (tipo_falha do PDF) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--schutz-navy, #0c233a)" }}>
          Diagnóstico Operacional
        </label>
        <div style={{ position: "relative" }}>
          <select
            value={filters.tipoFalha}
            onChange={(e) => onChangeFilter("tipoFalha", e.target.value)}
            style={{
              width: "100%",
              padding: "6px 24px 6px 8px",
              fontSize: "11.5px",
              borderRadius: "4px",
              border: "1px solid var(--sf-filter-input-border, #cbd5e1)",
              backgroundColor: "#ffffff",
              color: "#1e293b",
              appearance: "none",
              outline: "none",
              fontWeight: 500,
            }}
          >
            <option value="TODOS">Todos os Diagnósticos</option>
            <option value="0">0 — Operação Normal</option>
            <option value="1">1 — Desgaste de Ferramenta</option>
            <option value="2">2 — Falha de Refrigeração</option>
            <option value="3">3 — Desalinhamento / Trinca</option>
          </select>
          <ChevronDown size={13} color="#64748b" style={{ position: "absolute", right: 8, top: 9, pointerEvents: "none" }} />
        </div>
      </div>

      {/* 4. Campo: Intervalo de Amostragem IoT */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--schutz-navy, #0c233a)" }}>
          Frequência de Amostragem
        </label>
        <div
          style={{
            border: "1px solid var(--sf-filter-input-border, #cbd5e1)",
            borderRadius: "4px",
            padding: "6px 8px",
            fontSize: "11px",
            color: "#64748b",
            backgroundColor: "#f8fafc",
            fontWeight: 500,
          }}
        >
          Amostragem IoT contínua (5 min)
        </div>
      </div>

      {/* Informação de Rastreabilidade no rodapé da barra */}
      <div
        style={{
          marginTop: "auto",
          padding: "10px",
          backgroundColor: "#f8fafc",
          borderRadius: "6px",
          border: "1px solid #e2e8f0",
          fontSize: "10px",
          color: "#64748b",
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: "var(--schutz-navy, #0c233a)" }}>VulcanTech Smart Metals</strong>
        <br />
        Norma OEE: ISO 22400-2
        <br />
        Inspeção: AWS D1.1 / ISO 5817
      </div>
    </div>
  );
};
