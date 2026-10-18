import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.models import Alert, EnrichmentData, TriageResult, User
from ...services.triage_client import call_langchain_triage
from ...services.audit_service import log_audit_event
from ..deps import get_db, get_current_user, require_permission

router = APIRouter(prefix="/alerts", tags=["Alertas"])


class AlertCreateSchema(BaseModel):
    title: str = Field(..., min_length=3)
    description: Optional[str] = None
    source: str
    severity: str = "medium"
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    raw_payload: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)
    external_id: Optional[str] = None


@router.get("/")
async def list_alerts(
    severity: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    source: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("alerts:read"))
):
    query = select(Alert).order_by(desc(Alert.created_at))

    if severity:
        query = query.where(Alert.severity == severity)
    if status_filter:
        query = query.where(Alert.status == status_filter)
    if source:
        query = query.where(Alert.source == source)

    query = query.limit(limit).offset(offset)
    res = await db.execute(query)
    alerts = res.scalars().all()

    output = []
    for a in alerts:
        output.append({
            "id": str(a.id),
            "external_id": a.external_id,
            "title": a.title,
            "description": a.description,
            "source": a.source,
            "severity": a.severity,
            "status": a.status,
            "source_ip": str(a.source_ip) if a.source_ip else None,
            "destination_ip": str(a.destination_ip) if a.destination_ip else None,
            "tags": a.tags or [],
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "has_triage": a.triage_result is not None,
            "triage_verdict": a.triage_result.verdict if a.triage_result else None,
            "confidence": float(a.triage_result.confidence) if a.triage_result else None
        })

    return {"total": len(output), "items": output}


@router.get("/{alert_id}")
async def get_alert_detail(
    alert_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("alerts:read"))
):
    try:
        val_id = uuid.UUID(alert_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato UUID de alerta inválido")

    stmt = select(Alert).where(Alert.id == val_id)
    res = await db.execute(stmt)
    alert = res.scalar_one_or_none()

    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")

    triage_info = None
    if alert.triage_result:
        tr = alert.triage_result
        triage_info = {
            "verdict": tr.verdict,
            "severity": tr.severity,
            "confidence": float(tr.confidence),
            "reasoning": tr.reasoning,
            "recommended_actions": tr.recommended_actions,
            "ai_model": tr.ai_model,
            "execution_mode": tr.execution_mode,
            "execution_time_ms": tr.execution_time_ms,
            "created_at": tr.created_at.isoformat() if tr.created_at else None
        }

    enrichment_info = None
    if alert.enrichment:
        en = alert.enrichment
        enrichment_info = {
            "virustotal": en.virustotal or {},
            "abuseipdb": en.abuseipdb or {},
            "geoip": en.geoip or {},
            "whois": en.whois or {}
        }

    return {
        "id": str(alert.id),
        "external_id": alert.external_id,
        "title": alert.title,
        "description": alert.description,
        "source": alert.source,
        "severity": alert.severity,
        "status": alert.status,
        "source_ip": str(alert.source_ip) if alert.source_ip else None,
        "destination_ip": str(alert.destination_ip) if alert.destination_ip else None,
        "raw_payload": alert.raw_payload or {},
        "tags": alert.tags or [],
        "created_at": alert.created_at.isoformat() if alert.created_at else None,
        "triage": triage_info,
        "enrichment": enrichment_info
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_alert(
    payload: AlertCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("alerts:write"))
):
    alert = Alert(
        title=payload.title,
        description=payload.description,
        source=payload.source,
        severity=payload.severity,
        status="pending",
        source_ip=payload.source_ip,
        destination_ip=payload.destination_ip,
        raw_payload=payload.raw_payload,
        tags=payload.tags,
        external_id=payload.external_id or f"EXT-{uuid.uuid4().hex[:8].upper()}"
    )

    db.add(alert)
    await db.commit()
    await db.refresh(alert)

    # Registrar en auditoría
    await log_audit_event(
        db=db,
        user=current_user,
        username=current_user.email,
        ip_address="127.0.0.1",
        module="alerts",
        action="create",
        target_id=str(alert.id),
        details={"title": alert.title, "source": alert.source, "severity": alert.severity}
    )

    return {"message": "Alerta registrada correctamente", "id": str(alert.id)}


@router.post("/{alert_id}/triage")
async def trigger_alert_triage(
    alert_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("alerts:triage"))
):
    try:
        val_id = uuid.UUID(alert_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato UUID de alerta inválido")

    stmt = select(Alert).where(Alert.id == val_id)
    res = await db.execute(stmt)
    alert = res.scalar_one_or_none()

    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")

    # 1. Llamar al microservicio LangChain
    triage_data = await call_langchain_triage(
        alert_id=str(alert.id),
        title=alert.title,
        description=alert.description or "",
        source=alert.source,
        source_ip=str(alert.source_ip) if alert.source_ip else "",
        destination_ip=str(alert.destination_ip) if alert.destination_ip else "",
        raw_payload=alert.raw_payload or {},
        tags=alert.tags or []
    )

    # 2. Persistir Enriquecimiento si vino en la respuesta
    enrichment_payload = triage_data.get("enrichment", {})
    if enrichment_payload:
        stmt_en = select(EnrichmentData).where(EnrichmentData.alert_id == alert.id)
        res_en = await db.execute(stmt_en)
        existing_en = res_en.scalar_one_or_none()

        if not existing_en:
            new_en = EnrichmentData(
                alert_id=alert.id,
                virustotal=enrichment_payload.get("virustotal", {}),
                abuseipdb=enrichment_payload.get("abuseipdb", {}),
                geoip=enrichment_payload.get("geoip", {}),
                whois=enrichment_payload.get("whois", {})
            )
            db.add(new_en)

    # 3. Persistir o actualizar resultado de triaje
    stmt_tr = select(TriageResult).where(TriageResult.alert_id == alert.id)
    res_tr = await db.execute(stmt_tr)
    existing_tr = res_tr.scalar_one_or_none()

    verdict_val = triage_data.get("verdict", "suspicious")
    severity_val = triage_data.get("severity", alert.severity)

    if existing_tr:
        existing_tr.verdict = verdict_val
        existing_tr.severity = severity_val
        existing_tr.confidence = float(triage_data.get("confidence", 0.8))
        existing_tr.reasoning = triage_data.get("reasoning", "")
        existing_tr.recommended_actions = triage_data.get("recommended_actions", [])
        existing_tr.ai_model = triage_data.get("ai_model", "unknown")
        existing_tr.execution_mode = triage_data.get("execution_mode", "llm")
        existing_tr.execution_time_ms = int(triage_data.get("execution_time_ms", 100))
    else:
        new_tr = TriageResult(
            alert_id=alert.id,
            verdict=verdict_val,
            severity=severity_val,
            confidence=float(triage_data.get("confidence", 0.8)),
            reasoning=triage_data.get("reasoning", ""),
            recommended_actions=triage_data.get("recommended_actions", []),
            ai_model=triage_data.get("ai_model", "unknown"),
            execution_mode=triage_data.get("execution_mode", "llm"),
            execution_time_ms=int(triage_data.get("execution_time_ms", 100))
        )
        db.add(new_tr)

    # 4. Actualizar estado de la alerta
    if verdict_val == "false_positive":
        alert.status = "false_positive"
    elif severity_val in ["critical", "high"]:
        alert.status = "escalated"
    else:
        alert.status = "triaged"
    alert.severity = severity_val

    await db.commit()

    # 5. Registro en bitácora forense con hash SHA-256
    await log_audit_event(
        db=db,
        user=current_user,
        username=current_user.email,
        ip_address="127.0.0.1",
        module="triage",
        action="triage",
        target_id=str(alert.id),
        details={
            "verdict": verdict_val,
            "severity": severity_val,
            "execution_mode": triage_data.get("execution_mode"),
            "ai_model": triage_data.get("ai_model")
        }
    )

    return {
        "message": "Triaje completado con éxito",
        "triage": triage_data,
        "new_alert_status": alert.status
    }
