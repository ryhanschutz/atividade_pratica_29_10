// src/features/smart-factory/components/SmartFactoryDashboard.tsx
import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LabelList,
} from "recharts";
import { OeeGauge } from "./OeeGauge";
import {
  INITIAL_SMART_FACTORY_KPIS,
  INITIAL_ORDERS_BY_STATUS,
  INITIAL_DAILY_PRODUCTION,
  INITIAL_PRODUCTS_SHARE,
  INITIAL_OEE_PILLARS,
  INITIAL_ACTIVE_MACHINES,
  INITIAL_ACTIVE_EMPLOYEES,
  INITIAL_OEE_TIMELINE,
  INITIAL_OPERATOR_BARS,
} from "../data/smartFactoryData";
import { SmartFactoryFilterState } from "../types/smartFactory";

interface SmartFactoryDashboardProps {
  filters?: SmartFactoryFilterState;
}

export const SmartFactoryDashboard: React.FC<SmartFactoryDashboardProps> = ({ filters }) => {
  // Ajuste reativo baseado nos filtros do chão de fábrica (PDF)
  const isFiltered = filters && (filters.idCelula !== "TODAS" || filters.ligaMetalica !== "TODAS" || filters.tipoFalha !== "TODOS");

  const kpis = useMemo(() => {
    if (isFiltered) {
      return {
        ...INITIAL_SMART_FACTORY_KPIS,
        ordensConcluidas: 6,
        quantidadeProduzida: 3750,
        quantidadeAprovada: 3580,
        quantidadeRefugada: 170,
        rendimentoPrimeiraViagem: 95.5,
      };
    }
    return INITIAL_SMART_FACTORY_KPIS;
  }, [isFiltered]);

  const oeePillars = useMemo(() => {
    if (isFiltered) {
      return {
        oee: 68.2,
        disponibilidade: 88.0,
        performance: 82.0,
        qualidade: 94.5,
      };
    }
    return INITIAL_OEE_PILLARS;
  }, [isFiltered]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px 20px" }}>
      {/* 1. Banner de Boas-Vindas */}
      <div style={{ textAlign: "center", padding: "4px 0" }}>
        <h2
          style={{
            fontSize: "17px",
            fontWeight: 700,
            color: "var(--schutz-navy, #0c233a)",
            margin: 0,
            letterSpacing: "-0.2px",
          }}
        >
          Bem-vindo ao Schutz IGNITION OEE • Resumo Operacional em Tempo Real
        </h2>
        <p style={{ fontSize: "12px", color: "var(--sf-text-secondary, #64748b)", margin: "4px 0 0" }}>
          Monitoramento de produtividade e perdas cronometradas nas células robotizadas (CEL-201 a CEL-204) conforme ISO 22400-2
        </p>
      </div>

      {/* 2. Primeira Linha: 5 Cards de Métricas Principais */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "14px",
        }}
      >
        {/* Card 1 */}
        <div className="sf-card" style={{ textAlign: "center", padding: "16px 8px" }}>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--schutz-navy, #0c233a)" }}>
            {kpis.ordensConcluidas}
          </div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--sf-text-secondary, #64748b)", marginTop: "4px" }}>
            Ordens de Produção Finalizadas
          </div>
        </div>

        {/* Card 2 */}
        <div className="sf-card" style={{ textAlign: "center", padding: "16px 8px" }}>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--schutz-navy, #0c233a)" }}>
            {kpis.quantidadeProduzida.toLocaleString("pt-BR")}
          </div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--sf-text-secondary, #64748b)", marginTop: "4px" }}>
            Quantidade Total Produzida
          </div>
        </div>

        {/* Card 3 */}
        <div className="sf-card" style={{ textAlign: "center", padding: "16px 8px" }}>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--schutz-green, #16a34a)" }}>
            {kpis.quantidadeAprovada.toLocaleString("pt-BR")}
          </div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--sf-text-secondary, #64748b)", marginTop: "4px" }}>
            Peças Conformes (Aprovadas)
          </div>
        </div>

        {/* Card 4 - Refugo (Vermelho / Laranja de alerta conforme o logo) */}
        <div className="sf-card" style={{ textAlign: "center", padding: "16px 8px", borderLeft: "4px solid var(--schutz-red, #dc2626)" }}>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--schutz-red, #dc2626)" }}>
            {kpis.quantidadeRefugada.toLocaleString("pt-BR")}
          </div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--sf-text-secondary, #64748b)", marginTop: "4px" }}>
            Peças Refugadas (Sucata)
          </div>
        </div>

        {/* Card 5 - Rendimento de Primeira Viagem (FTY) */}
        <div className="sf-card" style={{ textAlign: "center", padding: "16px 8px" }}>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--schutz-orange, #ff5500)" }}>
            {kpis.rendimentoPrimeiraViagem.toFixed(1)} %
          </div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--sf-text-secondary, #64748b)", marginTop: "4px" }}>
            Rendimento de 1ª Viagem (FTY)
          </div>
        </div>
      </div>

      {/* 3. Segunda Linha: Ordens por Status | Produzido vs Refugado | Produção por Liga */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.6fr 1.4fr",
          gap: "14px",
          minHeight: "220px",
        }}
      >
        {/* Card: Ordens por Status */}
        <div className="sf-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--schutz-navy, #0c233a)", textAlign: "center", marginBottom: "8px" }}>
            Ordens de Fabricação por Status
          </div>
          <div style={{ height: "165px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={INITIAL_ORDERS_BY_STATUS}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={65}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {INITIAL_ORDERS_BY_STATUS.map((entry, index) => (
                    <Cell key={`cell-status-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} ordens`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legenda inline */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "8px",
              fontSize: "10px",
              color: "#64748b",
            }}
          >
            {INITIAL_ORDERS_BY_STATUS.map((item) => (
              <span key={item.name} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: item.color }} />
                {item.name} ({item.value}) ({item.percentage})
              </span>
            ))}
          </div>
        </div>

        {/* Card: Produção Realizada e Refugos */}
        <div className="sf-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--schutz-navy, #0c233a)", textAlign: "center", marginBottom: "8px" }}>
            Produção Diária vs. Peças Refugadas
          </div>
          <div style={{ height: "185px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={INITIAL_DAILY_PRODUCTION} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis
                  domain={[-500, 2000]}
                  ticks={[-500, 0, 500, 1000, 1500, 2000]}
                  tick={{ fontSize: 9, fill: "#64748b" }}
                  tickFormatter={(v) => (v === 0 ? "0" : `${v}`)}
                />
                <Tooltip formatter={(value, name) => [`${value} un`, name === "produced" ? "Produzido" : "Refugado"]} />
                <Line
                  type="monotone"
                  dataKey="produced"
                  name="produced"
                  stroke="var(--schutz-navy, #0c233a)"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: "var(--schutz-navy, #0c233a)" }}
                />
                <Line
                  type="monotone"
                  dataKey="rejected"
                  name="rejected"
                  stroke="var(--schutz-orange, #ff5500)"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: "var(--schutz-orange, #ff5500)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", fontSize: "11px", color: "#64748b" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: 10, height: 3, backgroundColor: "var(--schutz-navy, #0c233a)" }} /> Produzido
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: 10, height: 3, backgroundColor: "var(--schutz-orange, #ff5500)" }} /> Refugado
            </span>
          </div>
        </div>

        {/* Card: Produção por Liga Metálica (Conforme PDF VulcanTech) */}
        <div className="sf-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--schutz-navy, #0c233a)", textAlign: "center", marginBottom: "8px" }}>
            Volume por Liga Metálica (Lotes)
          </div>
          <div style={{ height: "165px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={INITIAL_PRODUCTS_SHARE}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={68}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                >
                  {INITIAL_PRODUCTS_SHARE.map((entry, index) => (
                    <Cell key={`cell-prod-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} kg / peças`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              flexWrap: "wrap",
              fontSize: "10px",
              color: "#64748b",
            }}
          >
            {INITIAL_PRODUCTS_SHARE.map((item) => (
              <span key={item.name} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: item.color }} />
                {item.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Terceira Linha: 4 OEE Gauges | Células Ativas | Alocação de Operadores */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2.4fr 1.3fr 1.3fr",
          gap: "14px",
        }}
      >
        {/* Bloco 4 Gauges OEE com Paleta Schutz IGNITION */}
        <div
          className="sf-card"
          style={{
            padding: "16px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            borderTop: "3px solid var(--schutz-orange, #ff5500)",
          }}
        >
          <OeeGauge title="OEE Geral" value={oeePillars.oee} color="var(--schutz-orange, #ff5500)" />
          <OeeGauge title="Disponibilidade" value={oeePillars.disponibilidade} color="var(--schutz-cyan, #0284c7)" />
          <OeeGauge title="Performance" value={oeePillars.performance} color="var(--schutz-green, #16a34a)" />
          <OeeGauge title="Qualidade" value={oeePillars.qualidade} color="var(--schutz-amber, #f59e0b)" />
        </div>

        {/* Card: Células Flexíveis (CEL-201..204) */}
        <div className="sf-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--schutz-navy, #0c233a)", textAlign: "center", marginBottom: "6px" }}>
            Status das Células (201-204)
          </div>
          <div style={{ height: "130px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={INITIAL_ACTIVE_MACHINES}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                >
                  {INITIAL_ACTIVE_MACHINES.map((entry, index) => (
                    <Cell key={`cell-m-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", fontSize: "10px", color: "#64748b" }}>
            <span>Operando (4) (100%)</span>
            <span>Parada (0) (0%)</span>
          </div>
        </div>

        {/* Card: Alocação de Operadores */}
        <div className="sf-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--schutz-navy, #0c233a)", textAlign: "center", marginBottom: "6px" }}>
            Equipe Operacional
          </div>
          <div style={{ height: "130px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={INITIAL_ACTIVE_EMPLOYEES}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                >
                  {INITIAL_ACTIVE_EMPLOYEES.map((entry, index) => (
                    <Cell key={`cell-e-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", fontSize: "10px", color: "#64748b" }}>
            <span>Em Posto (5) (62.5%)</span>
            <span>Pausa/Setup (3) (37.5%)</span>
          </div>
        </div>
      </div>

      {/* 5. Quarta Linha: Downtime Cards | Evolução Histórica OEE | Operadores Disponíveis */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 2.6fr 1.6fr",
          gap: "14px",
        }}
      >
        {/* Coluna Esquerda: Dois cards empilhados de Downtime */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Paradas Não Planejadas */}
          <div className="sf-card" style={{ flex: 1, padding: "16px", textAlign: "center", borderLeft: "4px solid var(--schutz-red, #dc2626)" }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--schutz-red, #dc2626)" }}>
              {kpis.paradasNaoPlanejadasHoras.toFixed(1)} h
            </div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--sf-text-secondary, #64748b)", marginTop: "4px" }}>
              Paradas Não Planejadas (Quebras)
            </div>
          </div>

          {/* Paradas Planejadas */}
          <div className="sf-card" style={{ flex: 1, padding: "16px", textAlign: "center", borderLeft: "4px solid var(--schutz-navy, #0c233a)" }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--schutz-navy, #0c233a)" }}>
              {kpis.paradasPlanejadasHoras.toFixed(1)} h
            </div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--sf-text-secondary, #64748b)", marginTop: "4px" }}>
              Paradas Planejadas (Setup / PCM)
            </div>
          </div>
        </div>

        {/* Card Central: Evolução dos KPIs de OEE */}
        <div className="sf-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--schutz-navy, #0c233a)", textAlign: "center", marginBottom: "6px" }}>
            Evolução dos Indicadores de OEE (ISO 22400-2)
          </div>
          <div style={{ height: "160px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={INITIAL_OEE_TIMELINE} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 50, 100]}
                  tick={{ fontSize: 9, fill: "#64748b" }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                <Line type="monotone" dataKey="oee" name="OEE Global" stroke="var(--schutz-orange, #ff5500)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="availability" name="Disponibilidade" stroke="var(--schutz-cyan, #0284c7)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="performance" name="Performance" stroke="var(--schutz-green, #16a34a)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="quality" name="Qualidade" stroke="var(--schutz-amber, #f59e0b)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Legenda dos 4 KPIs OEE */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "14px",
              fontSize: "10.5px",
              color: "#475569",
              marginTop: "4px",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--schutz-orange, #ff5500)" }} /> OEE
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--schutz-cyan, #0284c7)" }} /> Disponibilidade
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--schutz-green, #16a34a)" }} /> Performance
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--schutz-amber, #f59e0b)" }} /> Qualidade
            </span>
          </div>
        </div>

        {/* Card Direito: Operadores Disponíveis (Bar Chart) */}
        <div className="sf-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--schutz-navy, #0c233a)", textAlign: "center", marginBottom: "6px" }}>
            Operadores Escalados por Turno
          </div>
          <div style={{ height: "180px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={INITIAL_OPERATOR_BARS} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 9.5, fill: "#64748b" }} />
                <YAxis
                  domain={[0, 20]}
                  ticks={[0, 5, 10, 15, 20]}
                  tick={{ fontSize: 9, fill: "#64748b" }}
                />
                <Tooltip formatter={(value) => [`${value} operadores`, "Presentes"]} />
                <Bar dataKey="operators" fill="var(--schutz-orange, #ff5500)" radius={[2, 2, 0, 0]}>
                  <LabelList dataKey="operators" position="top" style={{ fill: "var(--schutz-navy, #0c233a)", fontSize: 11, fontWeight: 700 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
