from typing import Dict, Any, List
from .schemas import TriageVerdict, SeverityLevel


def run_heuristic_triage(
    title: str,
    description: str,
    source: str,
    source_ip: str,
    raw_payload: Dict[str, Any],
    tags: List[str],
    enrichment: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Motor heurístico de reglas deterministas (Fail-Safe Degraded Mode).
    Garantiza operación continua 24/7 ante indisponibilidad del runtime LLM.
    """
    vt = enrichment.get("virustotal", {})
    abuse = enrichment.get("abuseipdb", {})
    geo = enrichment.get("geoip", {})
    
    abuse_score = abuse.get("abuseConfidenceScore", 0)
    vt_malicious = vt.get("malicious_votes", 0)
    title_lower = (title + " " + (description or "")).lower()
    tags_lower = [t.lower() for t in tags]

    # Regla 1: Detección de Falsos Positivos conocidos (cron, backup, servicios internos)
    if any(k in title_lower for k in ["backup", "rsync", "cron", "healthcheck"]) and abuse_score == 0 and vt_malicious == 0:
        return {
            "verdict": TriageVerdict.FALSE_POSITIVE,
            "severity": SeverityLevel.LOW,
            "confidence": 0.95,
            "reasoning": (
                "Análisis heurístico degradado: La alerta coincide con patrones de mantenimiento corporativo "
                "(respaldos rutinarios o tareas programadas). Origen interno sin reportes de abuso ni detecciones OSINT."
            ),
            "recommended_actions": [
                "Generar regla de exclusión temporal en SIEM para suprimir ruido operativo",
                "Marcar la alerta como falso positivo verificado en bitácora"
            ],
            "ai_model": "heuristic-engine-v1"
        }

    # Regla 2: Compromiso Crítico / C2 / Ransomware
    if (
        any(k in title_lower for k in ["c2", "cobalt", "ransomware", "beacon", "meterpreter"]) or
        "c2" in tags_lower or
        vt_malicious >= 20 or
        abuse_score >= 95
    ):
        country = geo.get("country_name", "Desconocido")
        return {
            "verdict": TriageVerdict.MALICIOUS,
            "severity": SeverityLevel.CRITICAL,
            "confidence": 0.98,
            "reasoning": (
                f"Análisis heurístico degradado: Detección crítica de comunicación hacia infraestructura hostil ({country}). "
                f"VirusTotal reporta {vt_malicious} detecciones maliciosas y AbuseIPDB indica un índice de abuso del {abuse_score}%. "
                "Existe alto riesgo de exfiltración o control remoto no autorizado."
            ),
            "recommended_actions": [
                "Aislar inmediatamente el endpoint o servidor interno de la red local",
                "Bloquear la dirección IP hostil en la capa de cortafuegos perimetral",
                "Proceder con la extracción de artefactos forenses y volcado de memoria RAM",
                "Declarar incidente de seguridad de severidad crítica ante el SOC Lead"
            ],
            "ai_model": "heuristic-engine-v1"
        }

    # Regla 3: Fuerza Bruta / Inyección SQL / Exploits Web
    if (
        any(k in title_lower for k in ["brute force", "fuerza bruta", "sqli", "injection", "xss", "unauthorized"]) or
        "sqli" in tags_lower or
        "brute-force" in tags_lower or
        abuse_score >= 70
    ):
        return {
            "verdict": TriageVerdict.MALICIOUS,
            "severity": SeverityLevel.HIGH,
            "confidence": 0.92,
            "reasoning": (
                f"Análisis heurístico degradado: Actividad hostil confirmada compatible con ataque automatizado. "
                f"Puntuación de abuso del {abuse_score}% y múltiples reportes en la comunidad global de inteligencia."
            ),
            "recommended_actions": [
                f"Aplicar regla de descarte (DROP) en firewall para la IP {source_ip}",
                "Verificar en registros de autenticación si alguna cuenta fue vulnerada exitosamente",
                "Habilitar desafío CAPTCHA o bloqueo por intentos fallidos en el servicio diana"
            ],
            "ai_model": "heuristic-engine-v1"
        }

    # Regla 4: Escaneos de puertos y reconocimiento preliminar
    if any(k in title_lower for k in ["scan", "escaneo", "reconnaissance", "syn"]):
        return {
            "verdict": TriageVerdict.SUSPICIOUS,
            "severity": SeverityLevel.MEDIUM,
            "confidence": 0.85,
            "reasoning": (
                f"Análisis heurístico degradado: Reconocimiento perimetral oportunista detectado. "
                f"La IP origen {source_ip} presenta reputación sospechosa ({abuse_score}% de abuso). No se observó explotación exitosa."
            ),
            "recommended_actions": [
                f"Monitorear tráfico de la IP {source_ip} durante las próximas 48 horas",
                "Asegurar que los puertos de gestión administrativa (SSH/RDP) no permanezcan expuestos a WAN"
            ],
            "ai_model": "heuristic-engine-v1"
        }

    # Regla 5: Caso por defecto (Sospechoso bajo investigación)
    return {
        "verdict": TriageVerdict.SUSPICIOUS,
        "severity": SeverityLevel.MEDIUM,
        "confidence": 0.70,
        "reasoning": (
            "Análisis heurístico degradado: Alerta procesada sin coincidencia con firmas críticas específicas. "
            "Se requiere validación analítica complementaria por parte de un operador de seguridad."
        ),
        "recommended_actions": [
            "Revisar el contexto operativo del activo involucrado",
            "Solicitar triaje cognitivo manual al analista de turno"
        ],
        "ai_model": "heuristic-engine-v1"
    }
