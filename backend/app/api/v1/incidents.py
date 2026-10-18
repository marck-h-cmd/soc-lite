import uuid
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.models import Incident, Alert, User, Ticket
from ...services.audit_service import log_audit_event
from ..deps import get_db, get_current_user, require_permission

router = APIRouter(prefix="/incidents", tags=["Incidentes"])


class IncidentCreateSchema(BaseModel):
    alert_id: str
    title: str = Field(..., min_length=3)
    severity: str = "high"
    notes: Optional[str] = None
    assigned_to: Optional[str] = None
    ticket_reference: Optional[str] = None


class IncidentStatusUpdateSchema(BaseModel):
    status: str
    notes: Optional[str] = None


@router.get("/")
async def list_incidents(
    status_filter: Optional[str] = Query(None, alias="status"),
    severity: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("incidents:read"))
):
    query = select(Incident).order_by(desc(Incident.created_at))

    if status_filter:
        query = query.where(Incident.status == status_filter)
    if severity:
        query = query.where(Incident.severity == severity)

    query = query.limit(limit)
    res = await db.execute(query)
    incidents = res.scalars().all()

    output = []
    for inc in incidents:
        tickets_list = []
        for t in inc.tickets:
            tickets_list.append({
                "system": t.external_system,
                "ticket_id": t.ticket_id,
                "status": t.status
            })

        output.append({
            "id": str(inc.id),
            "alert_id": str(inc.alert_id),
            "title": inc.title,
            "severity": inc.severity,
            "status": inc.status,
            "assigned_analyst": inc.assigned_user.full_name if inc.assigned_user else "No asignado",
            "assigned_email": inc.assigned_user.email if inc.assigned_user else None,
            "ticket_reference": inc.ticket_reference,
            "notes": inc.notes,
            "created_at": inc.created_at.isoformat() if inc.created_at else None,
            "resolved_at": inc.resolved_at.isoformat() if inc.resolved_at else None,
            "tickets": tickets_list,
            "alert_source": inc.alert.source if inc.alert else "N/A",
            "source_ip": str(inc.alert.source_ip) if inc.alert and inc.alert.source_ip else None
        })

    return {"total": len(output), "items": output}


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_incident(
    payload: IncidentCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("incidents:escalate"))
):
    try:
        val_alert_id = uuid.UUID(payload.alert_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato UUID de alerta inválido")

    stmt_alert = select(Alert).where(Alert.id == val_alert_id)
    res_alert = await db.execute(stmt_alert)
    alert = res_alert.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")

    assigned_uuid = None
    if payload.assigned_to:
        try:
            assigned_uuid = uuid.UUID(payload.assigned_to)
        except ValueError:
            pass

    ticket_ref = payload.ticket_reference or f"OST-{datetime.now().strftime('%Y')}-{uuid.uuid4().hex[:4].upper()}"

    inc = Incident(
        alert_id=alert.id,
        title=payload.title,
        severity=payload.severity,
        status="open",
        assigned_to=assigned_uuid or current_user.id,
        ticket_reference=ticket_ref,
        notes=payload.notes
    )

    alert.status = "escalated"
    db.add(inc)

    # Crear ticket sincronizado externo
    tk = Ticket(
        incident_id=inc.id,
        external_system="osTicket",
        ticket_id=ticket_ref,
        status="Open",
        response_payload={"priority": payload.severity, "channel": "n8n_automated"}
    )
    db.add(tk)

    await db.commit()
    await db.refresh(inc)

    # Registrar en auditoría
    await log_audit_event(
        db=db,
        user=current_user,
        username=current_user.email,
        ip_address="127.0.0.1",
        module="incidents",
        action="escalate",
        target_id=str(inc.id),
        details={"alert_id": str(alert.id), "title": inc.title, "ticket": ticket_ref}
    )

    return {"message": "Incidente escalado y ticket creado exitosamente", "id": str(inc.id), "ticket": ticket_ref}


@router.patch("/{incident_id}/status")
async def update_incident_status(
    incident_id: str,
    payload: IncidentStatusUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("incidents:write"))
):
    try:
        val_id = uuid.UUID(incident_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato UUID de incidente inválido")

    stmt = select(Incident).where(Incident.id == val_id)
    res = await db.execute(stmt)
    inc = res.scalar_one_or_none()

    if not inc:
        raise HTTPException(status_code=404, detail="Incidente no encontrado")

    old_status = inc.status
    inc.status = payload.status
    if payload.notes:
        inc.notes = f"{inc.notes or ''}\n[{datetime.now(timezone.utc).isoformat()}] {payload.notes}".strip()

    if payload.status in ["resolved", "closed"] and not inc.resolved_at:
        inc.resolved_at = datetime.now(timezone.utc)

    await db.commit()

    # Auditoría
    await log_audit_event(
        db=db,
        user=current_user,
        username=current_user.email,
        ip_address="127.0.0.1",
        module="incidents",
        action="update",
        target_id=str(inc.id),
        details={"old_status": old_status, "new_status": payload.status}
    )

    return {"message": "Estado de incidente actualizado", "id": str(inc.id), "status": inc.status}
