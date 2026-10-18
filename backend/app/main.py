from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .middleware.audit_middleware import AccessAuditMiddleware
from .api.v1 import (
    auth,
    alerts,
    incidents,
    metrics,
    reports,
    rbac,
    users,
    audit
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API de SOC-Lite: Triaje cognitivo, auditoría forense inmutable y analítica de ciberseguridad",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# 1. Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Capa 1: Middleware de Auditoría de Accesos HTTP
app.add_middleware(AccessAuditMiddleware)

# 3. Incluir Routers API v1
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(metrics.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(rbac.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Salud"])
@app.get(f"{settings.API_V1_STR}/health", tags=["Salud"])
async def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": "production" if not settings.DEBUG else "development"
    }


@app.get("/", tags=["Raíz"])
async def root():
    return {
        "message": "Bienvenido a SOC-Lite API",
        "docs": "/docs",
        "version": settings.VERSION
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
