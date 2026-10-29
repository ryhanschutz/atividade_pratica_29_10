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
  finishProductionOrders: 23,
  producedQuantity: 14997,
  acceptedQuantity: 14179,
  rejectedQuantity: 818,
  firstTimeYield: 94.5,
  unplannedDowntimeHours: 64.4,
  plannedDowntimeHours: 26.7,
};

export const INITIAL_ORDERS_BY_STATUS: StatusOrderItem[] = [
  { name: "Finished", value: 23, percentage: "65.71%", color: "#6366f1" },
  { name: "Released", value: 5, percentage: "14.29%", color: "#f97316" },
  { name: "In Progress", value: 5, percentage: "14.29%", color: "#0ea5e9" },
  { name: "New", value: 2, percentage: "5.71%", color: "#22c55e" },
];

export const INITIAL_DAILY_PRODUCTION: DailyProductionPoint[] = [
  { date: "01 Apr 2024", produced: 1680, rejected: 95 },
  { date: "02 Apr 2024", produced: 1420, rejected: 82 },
  { date: "03 Apr 2024", produced: 1890, rejected: 110 },
  { date: "04 Apr 2024", produced: 1540, rejected: 92 },
  { date: "05 Apr 2024", produced: 1480, rejected: 84 },
];

export const INITIAL_PRODUCTS_SHARE: ProductShareItem[] = [
  { name: "Salad - PEAL Full p...", value: 3400, color: "#f43f5e" },
  { name: "Beef - Fried St...", value: 2950, color: "#38bdf8" },
  { name: "Seasoning Blend...", value: 2600, color: "#818cf8" },
  { name: "Chicken eggs - Cooke...", value: 2100, color: "#eab308" },
  { name: "Salad", value: 1850, color: "#f97316" },
];

export const INITIAL_OEE_PILLARS = {
  oee: 64.6,
  availability: 85.8,
  performance: 80.5,
  quality: 93.6,
};

export const INITIAL_ACTIVE_MACHINES = [
  { name: "Active (5)", value: 5, percentage: "83.33%", color: "#38bdf8" },
  { name: "Stopped (1)", value: 1, percentage: "16.67%", color: "#f43f5e" },
];

export const INITIAL_ACTIVE_EMPLOYEES = [
  { name: "Active (5)", value: 5, percentage: "62.5%", color: "#38bdf8" },
  { name: "Stopped (3)", value: 3, percentage: "37.5%", color: "#ef4444" },
];

export const INITIAL_OEE_TIMELINE: OeeTimelinePoint[] = [
  { date: "01 Apr 2024", oee: 62.4, availability: 84.5, performance: 79.2, quality: 93.1 },
  { date: "02 Apr 2024", oee: 61.8, availability: 83.9, performance: 78.8, quality: 93.4 },
  { date: "03 Apr 2024", oee: 67.2, availability: 87.4, performance: 82.5, quality: 94.2 },
  { date: "04 Apr 2024", oee: 65.1, availability: 86.2, performance: 81.0, quality: 93.8 },
  { date: "05 Apr 2024", oee: 64.6, availability: 85.8, performance: 80.5, quality: 93.6 },
];

export const INITIAL_OPERATOR_BARS: OperatorAvailabilityPoint[] = [
  { date: "01 Apr 2024", operators: 12 },
  { date: "02 Apr 2024", operators: 13 },
  { date: "03 Apr 2024", operators: 13 },
  { date: "04 Apr 2024", operators: 13 },
  { date: "05 Apr 2024", operators: 13 },
];

