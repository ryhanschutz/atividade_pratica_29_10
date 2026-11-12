// src/features/visao-computacional/types/vision.ts

export interface PontoDefeito {
  id: string;
  x: number;
  y: number;
  x_global: number;
  y_global: number;
  largura_px: number;
  altura_px: number;
  area_px: number;
  diametro_px: number;
  circularidade: number;
  severidade: "CRITICO" | "ALERTA" | "TOLERAVEL";
  classificacao_aws: string;
  acao_recomendada: string;
}

export interface PontoTermico {
  id: string;
  x: number;
  y: number;
  temperatura_c: number;
  area_px: number;
  zona_haz: string;
  severidade: "CRITICO" | "ALERTA" | "NOMINAL";
}

export interface WeldInspectionData {
  status_cordao: string;
  metricas: {
    status_cordao: string;
    total_poros_detectados: number;
    area_total_poros_px: number;
    taxa_porosidade_percentual: number;
    largura_imagem_px: number;
    altura_imagem_px: number;
    canny_thresh1: number;
    canny_thresh2: number;
  };
  roi: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  largura_imagem: number;
  altura_imagem: number;
  pontos_defeito: PontoDefeito[];
}

export interface HAZInspectionData {
  status_haz: string;
  metricas: {
    status_haz: string;
    percentual_area_sobreaquecida: number;
    pixels_criticos: number;
    diretriz_termica: string;
    pixel_temp_min_c: number;
    pixel_temp_max_c: number;
    pixel_temp_media_c: number;
    pixel_temp_desvio_c: number;
    pixel_temp_mediana_c: number;
  };
  largura_imagem: number;
  altura_imagem: number;
  temp_stats: {
    temp_min_c: number;
    temp_max_c: number;
    temp_media_c: number;
    temp_desvio_c: number;
    temp_mediana_c: number;
    histograma: Array<{ faixa: string; pixels: number }>;
  };
  pontos_quentes: PontoTermico[];
}

export interface OpenCVDataset {
  weld: Record<string, WeldInspectionData>;
  haz: Record<string, HAZInspectionData>;
}
