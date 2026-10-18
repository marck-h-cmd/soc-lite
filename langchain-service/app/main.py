from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .schemas import TriageRequest, TriageResponse, EnrichmentDataOutput
from .agent import perform_triage
from .tools.threat_intel import enrich_threat_intel

app = FastAPI(
    title="SOC-Lite LangChain Agent Service",
    description="Microservicio de razonamiento cognitivo, enriquecimiento OSINT y triaje resiliente para alertas SOC",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Salud"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "llm_provider": settings.LLM_PROVIDER,
        "ollama_model": settings.OLLAMA_MODEL,
        "ollama_endpoint": settings.OLLAMA_BASE_URL,
        "resilience": "automatic_heuristic_fallback_active"
    }


@app.post("/api/v1/triage", response_model=TriageResponse, tags=["Triaje"])
async def triage_alert(request: TriageRequest):
    """
    Ejecuta el triaje cognitivo de una alerta.
    Enriquece con OSINT y evalúa con LLM local o motor heurístico si el LLM no responde.
    """
    try:
        response = await perform_triage(request)
        return response
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error durante la ejecución del triaje: {str(exc)}"
        )


@app.get("/api/v1/enrich/{ip}", response_model=EnrichmentDataOutput, tags=["Enriquecimiento"])
async def enrich_ip_address(ip: str):
    """
    Consulta directa de telemetría e inteligencia de amenazas para una dirección IP.
    """
    try:
        data = await enrich_threat_intel(ip)
        return EnrichmentDataOutput(**data)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al enriquecer IP: {str(exc)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.SERVICE_PORT, reload=settings.DEBUG)
