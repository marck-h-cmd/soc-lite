import time
import json
import logging
from typing import Dict, Any
import httpx
from .config import settings
from .schemas import (
    TriageRequest,
    TriageResponse,
    TriageVerdict,
    SeverityLevel,
    ExecutionMode,
    EnrichmentDataOutput
)
from .tools.threat_intel import enrich_threat_intel
from .heuristics import run_heuristic_triage

logger = logging.getLogger("soc_lite_agent")
logging.basicConfig(level=logging.INFO)


async def call_ollama_llm(prompt: str) -> Dict[str, Any]:
    """
    Invoca el endpoint local de Ollama de forma asíncrona con control estricto de timeout.
    """
    url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "format": "json",
        "stream": False,
        "options": {
            "temperature": 0.1,
            "top_p": 0.9
        }
    }

    async with httpx.AsyncClient(timeout=settings.LLM_TIMEOUT_SECONDS) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        result = response.json()
        response_text = result.get("response", "{}")
        return json.loads(response_text)


def build_triage_prompt(req: TriageRequest, enrichment: Dict[str, Any]) -> str:
    return f"""Eres un Analista Senior de Ciberseguridad (SOC Tier 3).
Evalúa la siguiente alerta de seguridad y el contexto de Threat Intelligence asociado.
Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura exacta:
{{
  "verdict": "malicious" | "suspicious" | "benign" | "false_positive",
  "severity": "critical" | "high" | "medium" | "low" | "info",
  "confidence": 0.0 a 1.0 (float),
  "reasoning": "explicación forense concisa de al menos 20 palabras",
  "recommended_actions": ["accion 1", "accion 2", ...]
}}

DATOS DE LA ALERTA:
- ID: {req.alert_id}
- Titulo: {req.title}
- Descripcion: {req.description or 'N/A'}
- Origen: {req.source}
- IP Origen: {req.source_ip or 'N/A'}
- IP Destino: {req.destination_ip or 'N/A'}
- Payload Crudo: {json.dumps(req.raw_payload)}
- Tags: {json.dumps(req.tags)}

ENRIQUECIMIENTO THREAT INTELLIGENCE (OSINT):
- VirusTotal: {json.dumps(enrichment.get('virustotal', {}))}
- AbuseIPDB: {json.dumps(enrichment.get('abuseipdb', {}))}
- GeoIP: {json.dumps(enrichment.get('geoip', {}))}
"""


async def perform_triage(request: TriageRequest) -> TriageResponse:
    start_time = time.perf_counter()

    # 1. Enriquecimiento contextual concurrente
    enrichment_raw = await enrich_threat_intel(request.source_ip)
    enrichment_output = EnrichmentDataOutput(
        virustotal=enrichment_raw.get("virustotal", {}),
        abuseipdb=enrichment_raw.get("abuseipdb", {}),
        geoip=enrichment_raw.get("geoip", {}),
        whois=enrichment_raw.get("whois", {})
    )

    triage_data: Dict[str, Any] = {}
    execution_mode = ExecutionMode.LLM
    model_name = settings.OLLAMA_MODEL

    # 2. Intento de inferencia cognitiva con LLM
    try:
        prompt = build_triage_prompt(request, enrichment_raw)
        llm_response = await call_ollama_llm(prompt)

        # Normalizar y validar campos mínimos devueltos por LLM
        triage_data = {
            "verdict": TriageVerdict(llm_response.get("verdict", "suspicious").lower()),
            "severity": SeverityLevel(llm_response.get("severity", "medium").lower()),
            "confidence": float(llm_response.get("confidence", 0.8)),
            "reasoning": str(llm_response.get("reasoning", "Evaluación cognitiva completada por agente LLM.")),
            "recommended_actions": list(llm_response.get("recommended_actions", ["Investigar actividad del host"])),
            "ai_model": model_name
        }
        logger.info(f"Triaje exitoso con LLM ({model_name}) para alerta {request.alert_id}")

    except Exception as exc:
        # 3. Fallback Resiliente: Motor Heurístico Degradado (Cero Pérdida de Alertas)
        logger.warning(
            f"Fallo o timeout en runtime LLM ({exc}). Conmutando inmediatamente a modo degradado heurístico."
        )
        execution_mode = ExecutionMode.DEGRADED
        heuristic_res = run_heuristic_triage(
            title=request.title,
            description=request.description or "",
            source=request.source,
            source_ip=request.source_ip or "",
            raw_payload=request.raw_payload,
            tags=request.tags,
            enrichment=enrichment_raw
        )
        triage_data = heuristic_res
        model_name = heuristic_res.get("ai_model", "heuristic-engine-v1")

    # 4. Cálculo de tiempo de respuesta
    elapsed_ms = int((time.perf_counter() - start_time) * 1000)

    # 5. Validación final obligatoria con Pydantic
    return TriageResponse(
        alert_id=request.alert_id,
        verdict=triage_data["verdict"],
        severity=triage_data["severity"],
        confidence=triage_data["confidence"],
        reasoning=triage_data["reasoning"],
        recommended_actions=triage_data["recommended_actions"],
        enrichment=enrichment_output,
        ai_model=model_name,
        execution_mode=execution_mode,
        execution_time_ms=elapsed_ms
    )
