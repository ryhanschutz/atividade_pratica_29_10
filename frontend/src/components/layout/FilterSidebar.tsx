// src/components/layout/FilterSidebar.tsx
import React from "react";
import { RefreshCw, RotateCcw, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { SmartFactoryFilterState } from "../../features/smart-factory/types/smartFactory";

interface FilterSidebarProps {
  filters: SmartFactoryFilterState;
  onChangeFilter: <K extends keyof SmartFactoryFilterState>(
    key: K,
    val: SmartFactoryFilterState[K]
  ) => void;
  onSync: () => void;
  onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChangeFilter,
  onSync,
  onReset,
}) => {
  return (
    <div
      style={{
        width: "210px",
        backgroundColor: "var(--sf-filter-bg, #ffffff)",
        borderRight: "1px solid var(--sf-filter-border, #e2e8f0)",
        display: "flex",
        flexDirection: "column",
        padding: "14px 12px",
        gap: "12px",
        zIndex: 30,
        boxShadow: "1px 0 3px rgba(0,0,0,0.02)",
      }}
    >
      {/* 1. Botões Superiores: Laranja (Reload / Sync) e Ciano (Undo / Reset) */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "4px" }}>
        {/* Botão Laranja Reload */}
        <button
          onClick={onSync}
          title="Sincronizar e Recalcular OEE"
          style={{
            flex: 1,
            height: "36px",
            backgroundColor: "var(--sf-filter-btn-sync, #f59e0b)",
            border: "none",
            borderRadius: "4px",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(245, 158, 11, 0.4)",
          }}
        >
          <RefreshCw size={17} />
        </button>

        {/* Botão Ciano Reset */}
        <button
          onClick={onReset}
          title="Restaurar Filtros Padrão"
          style={{
            flex: 1,
            height: "36px",
            backgroundColor: "var(--sf-filter-btn-reset, #06b6d4)",
            border: "none",
            borderRadius: "4px",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(6, 182, 212, 0.4)",
          }}
        >
          <RotateCcw size={17} />
        </button>
      </div>

      {/* 2. Campo: Date */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--sf-filter-label, #475569)" }}>
          Date
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid var(--sf-filter-input-border, #cbd5e1)",
            borderRadius: "4px",
            padding: "5px 8px",
            fontSize: "11px",
            color: "var(--sf-filter-input-text, #1e293b)",
            backgroundColor: "#ffffff",
          }}
        >
          <span>{filters.dateRange}</span>
          <CalendarIcon size={13} color="#64748b" />
        </div>
      </div>

      {/* 3. Campo: Operation Type */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--sf-filter-label, #475569)" }}>
          Operation Type
        </label>
        <div style={{ position: "relative" }}>
          <select
            value={filters.operationType}
            onChange={(e) => onChangeFilter("operationType", e.target.value)}
            style={{
              width: "100%",
              padding: "5px 24px 5px 8px",
              fontSize: "11.5px",
              borderRadius: "4px",
              border: "1px solid var(--sf-filter-input-border, #cbd5e1)",
              backgroundColor: "#ffffff",
              color: "#1e293b",
              appearance: "none",
              outline: "none",
            }}
          >
            <option value="All">All</option>
            <option value="Usinagem CNC">Usinagem CNC</option>
            <option value="Soldagem MIG">Soldagem MIG</option>
            <option value="Estampagem">Estampagem</option>
          </select>
          <ChevronDown size={13} color="#64748b" style={{ position: "absolute", right: 8, top: 8, pointerEvents: "none" }} />
        </div>
      </div>

      {/* 4. Campo: Machine */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--sf-filter-label, #475569)" }}>
          Machine
        </label>
        <div style={{ position: "relative" }}>
          <select
            value={filters.machine}
            onChange={(e) => onChangeFilter("machine", e.target.value)}
            style={{
              width: "100%",
              padding: "5px 24px 5px 8px",
              fontSize: "11.5px",
              borderRadius: "4px",
              border: "1px solid var(--sf-filter-input-border, #cbd5e1)",
              backgroundColor: "#ffffff",
              color: "#1e293b",
              appearance: "none",
              outline: "none",
            }}
          >
            <option value="All">All</option>
            <option value="CEL-201">CEL-201</option>
            <option value="CEL-202">CEL-202</option>
            <option value="CEL-203">CEL-203</option>
            <option value="CEL-204">CEL-204</option>
          </select>
          <ChevronDown size={13} color="#64748b" style={{ position: "absolute", right: 8, top: 8, pointerEvents: "none" }} />
        </div>
      </div>

      {/* 5. Campo: Position */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--sf-filter-label, #475569)" }}>
          Position
        </label>
        <div style={{ position: "relative" }}>
          <select
            value={filters.position}
            onChange={(e) => onChangeFilter("position", e.target.value)}
            style={{
              width: "100%",
              padding: "5px 24px 5px 8px",
              fontSize: "11.5px",
              borderRadius: "4px",
              border: "1px solid var(--sf-filter-input-border, #cbd5e1)",
              backgroundColor: "#ffffff",
              color: "#1e293b",
              appearance: "none",
              outline: "none",
            }}
          >
            <option value="All">All</option>
            <option value="Linha 01">Linha 01</option>
            <option value="Linha 02">Linha 02</option>
          </select>
          <ChevronDown size={13} color="#64748b" style={{ position: "absolute", right: 8, top: 8, pointerEvents: "none" }} />
        </div>
      </div>

      {/* 6. Campo: Product */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--sf-filter-label, #475569)" }}>
          Product
        </label>
        <div style={{ position: "relative" }}>
          <select
            value={filters.product}
            onChange={(e) => onChangeFilter("product", e.target.value)}
            style={{
              width: "100%",
              padding: "5px 24px 5px 8px",
              fontSize: "11.5px",
              borderRadius: "4px",
              border: "1px solid var(--sf-filter-input-border, #cbd5e1)",
              backgroundColor: "#ffffff",
              color: "#1e293b",
              appearance: "none",
              outline: "none",
            }}
          >
            <option value="All">All</option>
            <option value="Liga_Titanio_Ti6Al4V">Liga_Titanio_Ti6Al4V</option>
            <option value="Aluminio_7075">Aluminio_7075</option>
            <option value="Aco_Carbono_316L">Aco_Carbono_316L</option>
          </select>
          <ChevronDown size={13} color="#64748b" style={{ position: "absolute", right: 8, top: 8, pointerEvents: "none" }} />
        </div>
      </div>

      {/* 7. Campo: Shift Name */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--sf-filter-label, #475569)" }}>
          Shift Name
        </label>
        <div style={{ position: "relative" }}>
          <select
            value={filters.shiftName}
            onChange={(e) => onChangeFilter("shiftName", e.target.value)}
            style={{
              width: "100%",
              padding: "5px 24px 5px 8px",
              fontSize: "11.5px",
              borderRadius: "4px",
              border: "1px solid var(--sf-filter-input-border, #cbd5e1)",
              backgroundColor: "#ffffff",
              color: "#1e293b",
              appearance: "none",
              outline: "none",
            }}
          >
            <option value="All">All</option>
            <option value="Turno 1 (06:00 - 14:00)">Turno 1 (06:00 - 14:00)</option>
            <option value="Turno 2 (14:00 - 22:00)">Turno 2 (14:00 - 22:00)</option>
            <option value="Turno 3 (22:00 - 06:00)">Turno 3 (22:00 - 06:00)</option>
          </select>
          <ChevronDown size={13} color="#64748b" style={{ position: "absolute", right: 8, top: 8, pointerEvents: "none" }} />
        </div>
      </div>

      {/* 8. Campo: Employee */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--sf-filter-label, #475569)" }}>
          Employee
        </label>
        <div style={{ position: "relative" }}>
          <select
            value={filters.employee}
            onChange={(e) => onChangeFilter("employee", e.target.value)}
            style={{
              width: "100%",
              padding: "5px 24px 5px 8px",
              fontSize: "11.5px",
              borderRadius: "4px",
              border: "1px solid var(--sf-filter-input-border, #cbd5e1)",
              backgroundColor: "#ffffff",
              color: "#1e293b",
              appearance: "none",
              outline: "none",
            }}
          >
            <option value="All">All</option>
            <option value="Carlos Silva (Op. CNC)">Carlos Silva (Op. CNC)</option>
            <option value="Mariana Santos (Inspetora)">Mariana Santos (Inspetora)</option>
            <option value="Roberto Souza (Soldador)">Roberto Souza (Soldador)</option>
          </select>
          <ChevronDown size={13} color="#64748b" style={{ position: "absolute", right: 8, top: 8, pointerEvents: "none" }} />
        </div>
      </div>
    </div>
  );
};

