import logging
from typing import Dict, Any
import httpx
from ..core.config import settings

logger = logging.getLogger("soc_lite_triage_client")


async def call_langchain_triage(
    alert_id: str,
    title: str,
    description: str,
    source: str,
    source_ip: str,
    destination_ip: str,
    raw_payload: Dict[str, Any],
    tags: list
) -> Dict[str, Any]:
    """
    Cliente HTTP asíncrono para delegar el triaje cognitivo al microservicio LangChain.
    """
    url = f"{settings.LANGCHAIN_SERVICE_URL.rstrip('/')}/api/v1/triage"
    payload = {
        "alert_id": str(alert_id),
        "title": title,
        "description": description,
        "source": source,
        "source_ip": str(source_ip) if source_ip else None,
        "destination_ip": str(destination_ip) if destination_ip else None,
        "raw_payload": raw_payload or {},
        "tags": tags or []
    }

    try:
        async with httpx.AsyncClient(timeout=settings.LANGCHAIN_TIMEOUT_SECONDS) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            return resp.json()
    except Exception as exc:
        logger.error(f"Error conectando con microservicio LangChain ({url}): {exc}")
        # Si el microservicio estuviera temporalmente inalcanzable, fallback heurístico de emergencia
        return {
            "alert_id": str(alert_id),
            "verdict": "suspicious",
            "severity": "medium",
            "confidence": 0.70,
            "reasoning": f"Triaje local de emergencia: microservicio de IA inalcanzable ({str(exc)}). Marcado para revision manual.",
            "recommended_actions": ["Verificar disponibilidad de servicios de red", "Reintentar triaje cognitivo"],
            "enrichment": {
                "virustotal": {},
                "abuseipdb": {},
                "geoip": {},
                "whois": {}
            },
            "ai_model": "backend-emergency-heuristic",
            "execution_mode": "degraded",
            "execution_time_ms": 50
        }
