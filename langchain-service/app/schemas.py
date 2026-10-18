from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from enum import Enum


class SeverityLevel(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class TriageVerdict(str, Enum):
    MALICIOUS = "malicious"
    SUSPICIOUS = "suspicious"
    BENIGN = "benign"
    FALSE_POSITIVE = "false_positive"
    UNKNOWN = "unknown"


class ExecutionMode(str, Enum):
    LLM = "llm"
    DEGRADED = "degraded"


class TriageRequest(BaseModel):
    alert_id: str = Field(..., description="Identificador único UUID de la alerta")
    title: str = Field(..., min_length=3, description="Título o descripción corta de la alerta")
    description: Optional[str] = Field(None, description="Detalles adicionales del evento")
    source: str = Field(..., description="Sistema emisor (ej. Wazuh, Suricata, OPNsense)")
    source_ip: Optional[str] = Field(None, description="Dirección IP de origen sospechosa")
    destination_ip: Optional[str] = Field(None, description="Dirección IP destino del activo interno")
    raw_payload: Dict[str, Any] = Field(default_factory=dict, description="Carga útil JSON cruda")
    tags: List[str] = Field(default_factory=list, description="Etiquetas iniciales")


class EnrichmentDataOutput(BaseModel):
    virustotal: Dict[str, Any] = Field(default_factory=dict)
    abuseipdb: Dict[str, Any] = Field(default_factory=dict)
    geoip: Dict[str, Any] = Field(default_factory=dict)
    whois: Dict[str, Any] = Field(default_factory=dict)


class TriageResponse(BaseModel):
    alert_id: str
    verdict: TriageVerdict
    severity: SeverityLevel
    confidence: float = Field(..., ge=0.0, le=1.0, description="Puntuación de certeza normalizada entre 0 y 1")
    reasoning: str = Field(..., min_length=15, description="Explicación analítica forense")
    recommended_actions: List[str] = Field(..., min_length=1, description="Lista de medidas de mitigación sugeridas")
    enrichment: EnrichmentDataOutput
    ai_model: str = Field(..., description="Nombre del modelo LLM o motor heurístico ejecutor")
    execution_mode: ExecutionMode = Field(..., description="'llm' o 'degraded'")
    execution_time_ms: int = Field(..., ge=0, description="Tiempo de ejecución en milisegundos")

    @field_validator("confidence")
    @classmethod
    def round_confidence(cls, v: float) -> float:
        return round(v, 3)
