// src/features/smart-factory/data/smartFactoryData.ts
import {
  SmartFactoryKpis,
  StatusOrderItem,
  DailyProductionPoint,
  ProductShareItem,
  OeeTimelinePoint,
  OperatorAvailabilityPoint,
} from "../types/smartFactory";

export const INITIAL_SMART_FACTORY_KPIS: SmartFactoryKpis = {
  ordensConcluidas: 23,
  quantidadeProduzida: 14997,
  quantidadeAprovada: 14179,
  quantidadeRefugada: 818,
  rendimentoPrimeiraViagem: 94.5,
  paradasNaoPlanejadasHoras: 64.4,
  paradasPlanejadasHoras: 26.7,
};

export const INITIAL_ORDERS_BY_STATUS: StatusOrderItem[] = [
  { name: "Concluída", value: 23, percentage: "65.7%", color: "#0c233a" },
  { name: "Em Processamento", value: 5, percentage: "14.3%", color: "#0284c7" },
  { name: "Liberada", value: 5, percentage: "14.3%", color: "#ff5500" },
  { name: "Nova", value: 2, percentage: "5.7%", color: "#16a34a" },
];

export const INITIAL_DAILY_PRODUCTION: DailyProductionPoint[] = [
  { date: "01/10", produced: 1680, rejected: 95 },
  { date: "02/10", produced: 1420, rejected: 82 },
  { date: "03/10", produced: 1890, rejected: 110 },
  { date: "04/10", produced: 1540, rejected: 92 },
  { date: "05/10", produced: 1480, rejected: 84 },
];

// Ligas Metálicas reais da VulcanTech especificadas no PDF
export const INITIAL_PRODUCTS_SHARE: ProductShareItem[] = [
  { name: "Liga Titânio (Ti6Al4V)", value: 6850, color: "#ff5500" },
  { name: "Alumínio 7075 Aero", value: 4920, color: "#0284c7" },
  { name: "Aço Carbono 316L", value: 3227, color: "#0c233a" },
];

export const INITIAL_OEE_PILLARS = {
  oee: 64.6,
  disponibilidade: 85.8,
  performance: 80.5,
  qualidade: 93.6,
};

export const INITIAL_ACTIVE_MACHINES = [
  { name: "Operando (4 Células)", value: 4, percentage: "100%", color: "#16a34a" },
  { name: "Manutenção (0)", value: 0, percentage: "0%", color: "#dc2626" },
];

export const INITIAL_ACTIVE_EMPLOYEES = [
  { name: "Operadores Ativos (5)", value: 5, percentage: "62.5%", color: "#0284c7" },
  { name: "Pausa / Setup (3)", value: 3, percentage: "37.5%", color: "#ff5500" },
];

export const INITIAL_OEE_TIMELINE: OeeTimelinePoint[] = [
  { date: "01/10", oee: 62.4, availability: 84.5, performance: 79.2, quality: 93.1 },
  { date: "02/10", oee: 61.8, availability: 83.9, performance: 78.8, quality: 93.4 },
  { date: "03/10", oee: 67.2, availability: 87.4, performance: 82.5, quality: 94.2 },
  { date: "04/10", oee: 65.1, availability: 86.2, performance: 81.0, quality: 93.8 },
  { date: "05/10", oee: 64.6, availability: 85.8, performance: 80.5, quality: 93.6 },
];

export const INITIAL_OPERATOR_BARS: OperatorAvailabilityPoint[] = [
  { date: "01/10", operators: 12 },
  { date: "02/10", operators: 13 },
  { date: "03/10", operators: 13 },
  { date: "04/10", operators: 13 },
  { date: "05/10", operators: 13 },
];
