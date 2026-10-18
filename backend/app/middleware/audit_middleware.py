import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("soc_lite_access_audit")
logging.basicConfig(level=logging.INFO)


class AccessAuditMiddleware(BaseHTTPMiddleware):
    """
    Capa 1 de Auditoría: Registro de telemetría de acceso HTTP.
    Registra cada interacción, IP origen, ruta, método, latencia y código HTTP.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        # Excluir rutas de telemetría constante para no saturar el log
        if request.url.path in ["/health", "/docs", "/openapi.json"]:
            return await call_next(request)

        start_time = time.perf_counter()
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path

        try:
            response = await call_next(request)
            duration_ms = (time.perf_counter() - start_time) * 1000
            status_code = response.status_code

            logger.info(
                f"[ACCESS_AUDIT] IP={client_ip} METHOD={method} PATH={path} "
                f"STATUS={status_code} DURATION={duration_ms:.2f}ms"
            )
            return response

        except Exception as exc:
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.error(
                f"[ACCESS_AUDIT_ERROR] IP={client_ip} METHOD={method} PATH={path} "
                f"EXCEPTION={str(exc)} DURATION={duration_ms:.2f}ms"
            )
            raise exc
