// src/features/smart-factory/types/smartFactory.ts

export interface SmartFactoryFilterState {
  periodo: string;
  idCelula: string;
  ligaMetalica: string;
  tipoFalha: string;
}

export interface SmartFactoryKpis {
  ordensConcluidas: number;
  quantidadeProduzida: number;
  quantidadeAprovada: number;
  quantidadeRefugada: number;
  rendimentoPrimeiraViagem: number;
  paradasNaoPlanejadasHoras: number;
  paradasPlanejadasHoras: number;
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
