# Atende: RF-014, RF-015, RNF-003
"""
Esquemas Pydantic para validação e serialização da API RESTful.
Responsabilidades:
- Validação estrita de limites físicos e tipos.
- DTOs para requisições e respostas.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class SensorTelemetryInput(BaseModel):
    """Telemetria recebida de sensor em chão de fábrica."""
    model_config = ConfigDict(extra="ignore")

    id_celula: str = Field(..., example="CEL-201", description="Identificador da célula (CEL-201 a CEL-204)")
    liga_metalica: str = Field(..., example="Liga_Titanio_Ti6Al4V", description="Liga metálica processada")
    temperatura_fuso_c: float = Field(..., ge=0.0, le=250.0, description="Temperatura do fuso (°C)")
    vibracao_triaxial_rms_mms: float = Field(..., ge=0.0, le=50.0, description="Vibração triaxial RMS (mm/s)")
    torque_fuso_nm: float = Field(..., ge=0.0, le=500.0, description="Torque instantâneo (Nm)")
    vazao_refrigerante_lmin: float = Field(..., ge=0.0, le=100.0, description="Vazão de refrigeração (L/min)")
    corrente_estator_amp: float = Field(..., ge=0.0, le=150.0, description="Corrente do estator (A)")
    pressao_hidraulica_bar: float = Field(..., ge=0.0, le=400.0, description="Pressão hidráulica (Bar)")
    nivel_ruido_db: float = Field(..., ge=20.0, le=140.0, description="Emissão acústica (dB)")
    timestamp: Optional[str] = Field(None, example="2026-10-29 08:00:00")


class BatchTelemetryInput(BaseModel):
    """Lote de telemetrias para inferência agrupada."""
    items: List[SensorTelemetryInput]


class OEEResponse(BaseModel):
    """Métricas preditivas de OEE."""
    disponibilidade: float
    performance: float
    qualidade: float
    oee_calculado: float
    oee_percentual: str
    justificativa_impacto: str


class PredictionResponse(BaseModel):
    """Diagnóstico preditivo, confiança e prescrição industrial."""
    id_celula: str
    liga_metalica: str
    codigo_falha: int
    diagnostico: str
    probabilidade_confianca: float
    acao_industrial_recomendada: str
    severidade: str
    comando_clp_hex: str
    diretriz_operacional: str
    impacto_oee: OEEResponse


class BatchPredictionResponse(BaseModel):
    """Resposta consolidada de inferência em lote."""
    total_processado: int
    predicoes: List[PredictionResponse]


class SystemHealthResponse(BaseModel):
    """Métricas de saúde e consumo de recursos."""
    status: str
    versao: str
    uptime_segundos: float
    memoria_ram_mb: float
    cpu_percentual: float
    modelo_carregado: bool


class PontoDefeito(BaseModel):
    """Ponto de descontinuidade ou poro identificado pelo OpenCV."""
    id: str
    x: int
    y: int
    x_global: int
    y_global: int
    largura_px: int
    altura_px: int
    area_px: float
    diametro_px: float
    circularidade: float
    severidade: str
    classificacao_aws: str
    acao_recomendada: str


class PontoTermico(BaseModel):
    """Ponto quente ou pico térmico identificado no perfil HAZ."""
    id: str
    x: int
    y: int
    temperatura_c: float
    area_px: float
    zona_haz: str
    severidade: str


class WeldInspectionResponse(BaseModel):
    """Resultado da inspeção óptica Canny do cordão de solda com pontos identificados."""
    status_cordao: str
    total_poros_detectados: int
    area_total_poros_px: float
    taxa_porosidade_percentual: float
    largura_imagem_px: int
    altura_imagem_px: int
    pontos_defeito: Optional[List[PontoDefeito]] = []
    etapas_base64: Optional[Dict[str, str]] = None


class HAZAnalysisResponse(BaseModel):
    """Resultado da análise termográfica HSV da Zona Afetada pelo Calor."""
    status_haz: str
    percentual_area_sobreaquecida: float
    pixels_criticos: int
    diretriz_termica: str
    pixel_temp_min_c: Optional[float] = 25.0
    pixel_temp_max_c: Optional[float] = 1500.0
    pixel_temp_media_c: Optional[float] = 350.0
    pontos_quentes: Optional[List[PontoTermico]] = []
    etapas_base64: Optional[Dict[str, str]] = None
