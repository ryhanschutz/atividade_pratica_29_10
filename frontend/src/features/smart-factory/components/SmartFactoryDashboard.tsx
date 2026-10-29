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
  // Ajuste reativo com base no filtro selecionado (ex: máquina específica ou produto)
  const isFiltered = filters && filters.machine !== "All";

  const kpis = useMemo(() => {
    if (isFiltered) {
      return {
        ...INITIAL_SMART_FACTORY_KPIS,
        finishProductionOrders: 6,
        producedQuantity: 3750,
        acceptedQuantity: 3580,
        rejectedQuantity: 170,
        firstTimeYield: 95.5,
      };
    }
    return INITIAL_SMART_FACTORY_KPIS;
  }, [isFiltered]);

  const oeePillars = useMemo(() => {
    if (isFiltered) {
      return {
        oee: 68.2,
        availability: 88.0,
        performance: 82.0,
        quality: 94.5,
      };
    }
    return INITIAL_OEE_PILLARS;
  }, [isFiltered]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px 20px" }}>
      {/* 1. Banner de Boas-Vindas */}
      <div style={{ textAlign: "center", padding: "6px 0 2px" }}>
        <h2
          style={{
            fontSize: "17px",
            fontWeight: 700,
            color: "var(--sf-text-primary, #1e293b)",
            margin: 0,
            letterSpacing: "-0.2px",
          }}
        >
          Welcome to the Schutz Factory. Here's a summary of what happened on your shop floor
        </h2>
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
          <div style={{ fontSize: "28px", fontWeight: 600, color: "var(--sf-metric-primary, #1e293b)" }}>
            {kpis.finishProductionOrders}
          </div>
          <div style={{ fontSize: "11px", color: "var(--sf-text-secondary, #64748b)", marginTop: "4px" }}>
            Finish Production Orders
          </div>
        </div>

        {/* Card 2 */}
        <div className="sf-card" style={{ textAlign: "center", padding: "16px 8px" }}>
          <div style={{ fontSize: "28px", fontWeight: 600, color: "var(--sf-metric-primary, #1e293b)" }}>
            {kpis.producedQuantity.toLocaleString("en-US")}
          </div>
          <div style={{ fontSize: "11px", color: "var(--sf-text-secondary, #64748b)", marginTop: "4px" }}>
            Produced Quantity
          </div>
        </div>

        {/* Card 3 */}
        <div className="sf-card" style={{ textAlign: "center", padding: "16px 8px" }}>
          <div style={{ fontSize: "28px", fontWeight: 600, color: "var(--sf-metric-primary, #1e293b)" }}>
            {kpis.acceptedQuantity.toLocaleString("en-US")}
          </div>
          <div style={{ fontSize: "11px", color: "var(--sf-text-secondary, #64748b)", marginTop: "4px" }}>
            Accepted Quantity
          </div>
        </div>

        {/* Card 4 - Refugo (Vermelho conforme referência) */}
        <div className="sf-card" style={{ textAlign: "center", padding: "16px 8px" }}>
          <div style={{ fontSize: "28px", fontWeight: 600, color: "var(--sf-metric-danger, #dc2626)" }}>
            {kpis.rejectedQuantity.toLocaleString("en-US")}
          </div>
          <div style={{ fontSize: "11px", color: "var(--sf-text-secondary, #64748b)", marginTop: "4px" }}>
            Rejected Quantity
          </div>
        </div>

        {/* Card 5 - Rendimento de Primeira Viagem */}
        <div className="sf-card" style={{ textAlign: "center", padding: "16px 8px" }}>
          <div style={{ fontSize: "28px", fontWeight: 600, color: "var(--sf-metric-primary, #1e293b)" }}>
            {kpis.firstTimeYield.toFixed(1)} %
          </div>
          <div style={{ fontSize: "11px", color: "var(--sf-text-secondary, #64748b)", marginTop: "4px" }}>
            First Time Yield
          </div>
        </div>
      </div>

      {/* 3. Segunda Linha: Orders by Status | Produced & Rejected | Produced by Product */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.6fr 1.4fr",
          gap: "14px",
          minHeight: "220px",
        }}
      >
        {/* Card: Orders by Status */}
        <div className="sf-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", textAlign: "center", marginBottom: "8px" }}>
            Orders by Status
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
          {/* Legenda compacta inline */}
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

        {/* Card: Produced and Rejected Quantity */}
        <div className="sf-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", textAlign: "center", marginBottom: "8px" }}>
            Produced and Rejected Quantity
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
                  tickFormatter={(v) => (v === 0 ? "0.0" : `${(v / 1000).toFixed(1)}k`)}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="produced"
                  name="Produced"
                  stroke="var(--sf-chart-produced-line, #312e81)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#312e81" }}
                />
                <Line
                  type="monotone"
                  dataKey="rejected"
                  name="Rejected"
                  stroke="var(--sf-chart-rejected-line, #f43f5e)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#f43f5e" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card: Produced Quantity by Product */}
        <div className="sf-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", textAlign: "center", marginBottom: "8px" }}>
            Produced Quantity by Product
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
                <Tooltip formatter={(value, name) => [`${value} un`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Rótulos */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "10px",
              color: "#64748b",
              padding: "0 8px",
            }}
          >
            <span>Salad</span>
            <span>Chicken eggs</span>
            <span>Beef - Fried St...</span>
          </div>
        </div>
      </div>

      {/* 4. Terceira Linha: 4 OEE Gauges | Active Machines | Active Employees */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2.4fr 1.3fr 1.3fr",
          gap: "14px",
        }}
      >
        {/* Bloco 4 Gauges OEE */}
        <div
          className="sf-card"
          style={{
            padding: "16px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <OeeGauge title="OEE" value={oeePillars.oee} color="#84cc16" />
          <OeeGauge title="Availability" value={oeePillars.availability} color="#84cc16" />
          <OeeGauge title="Performance" value={oeePillars.performance} color="#84cc16" />
          <OeeGauge title="Quality" value={oeePillars.quality} color="#84cc16" />
        </div>

        {/* Card: Active Machines */}
        <div className="sf-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", textAlign: "center", marginBottom: "6px" }}>
            Active Machines
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
            <span>Active (5) (83.33%)</span>
            <span>Stopped (1) (16.67%)</span>
          </div>
        </div>

        {/* Card: Active Employees */}
        <div className="sf-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", textAlign: "center", marginBottom: "6px" }}>
            Active Employees
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
            <span>Active (5) (62.5%)</span>
            <span>Stopped (3) (37.5%)</span>
          </div>
        </div>
      </div>

      {/* 5. Quarta Linha: Downtime Cards | OEE KPI's Line Chart | Available Operators Bar Chart */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 2.6fr 1.6fr",
          gap: "14px",
        }}
      >
        {/* Coluna Esquerda: Dois cards empilhados de Downtime */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Unplanned Downtime */}
          <div className="sf-card" style={{ flex: 1, padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: 600, color: "var(--sf-metric-danger, #dc2626)" }}>
              {kpis.unplannedDowntimeHours.toFixed(1)}
            </div>
            <div style={{ fontSize: "11px", color: "var(--sf-text-secondary, #64748b)", marginTop: "4px" }}>
              Unplanned Downtime (h)
            </div>
          </div>

          {/* Planned Downtime */}
          <div className="sf-card" style={{ flex: 1, padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: 600, color: "var(--sf-metric-primary, #1e293b)" }}>
              {kpis.plannedDowntimeHours.toFixed(1)}
            </div>
            <div style={{ fontSize: "11px", color: "var(--sf-text-secondary, #64748b)", marginTop: "4px" }}>
              Planned Downtime (h)
            </div>
          </div>
        </div>

        {/* Card Central: OEE KPI's (Multi-linha) */}
        <div className="sf-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", textAlign: "center", marginBottom: "6px" }}>
            OEE KPI's
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
                  tickFormatter={(v) => `${v} %`}
                />
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                <Line type="monotone" dataKey="oee" name="OEE" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="availability" name="Availability" stroke="#1e40af" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="performance" name="Performance" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="quality" name="Quality" stroke="#ca8a04" strokeWidth={2} dot={{ r: 3 }} />
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
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#8b5cf6" }} /> OEE
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#1e40af" }} /> Availability
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981" }} /> Performance
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#ca8a04" }} /> Quality
            </span>
          </div>
        </div>

        {/* Card Direito: Available Operators (Bar Chart com números sobre as barras) */}
        <div className="sf-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", textAlign: "center", marginBottom: "6px" }}>
            Available Operators
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
                <Tooltip formatter={(value) => [`${value} operadores`, "Disponíveis"]} />
                <Bar dataKey="operators" fill="var(--sf-chart-operators-bar, #06b6d4)" radius={[2, 2, 0, 0]}>
                  <LabelList dataKey="operators" position="top" style={{ fill: "#1e293b", fontSize: 11, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

