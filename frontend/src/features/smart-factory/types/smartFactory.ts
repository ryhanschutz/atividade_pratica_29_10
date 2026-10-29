// src/features/smart-factory/types/smartFactory.ts

export interface SmartFactoryFilterState {
  dateRange: string;
  operationType: string;
  machine: string;
  position: string;
  product: string;
  shiftName: string;
  employee: string;
}

export interface SmartFactoryKpis {
  finishProductionOrders: number;
  producedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  firstTimeYield: number;
  unplannedDowntimeHours: number;
  plannedDowntimeHours: number;
}

export interface StatusOrderItem {
  name: string;
  value: number;
  percentage: string;
  color: string;
}

export interface DailyProductionPoint {
  date: string;
  produced: number;
  rejected: number;
}

export interface ProductShareItem {
  name: string;
  value: number;
  color: string;
}

export interface GaugeMetric {
  title: string;
  value: number;
  formatted: string;
  color?: string;
}

export interface OeeTimelinePoint {
  date: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
}

export interface OperatorAvailabilityPoint {
  date: string;
  operators: number;
}

