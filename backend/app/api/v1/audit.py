from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.models import AuditLog, User
from ...services.audit_service import verify_audit_chain
from ..deps import get_db, get_current_user, require_permission

router = APIRouter(prefix="/audit", tags=["Bitácora de Auditoría Forense"])


@router.get("/")
async def list_audit_logs(
    module: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    username: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("audit:read"))
):
    query = select(AuditLog).order_by(desc(AuditLog.id))

    if module:
        query = query.where(AuditLog.module == module)
    if action:
        query = query.where(AuditLog.action == action)
    if username:
        query = query.where(AuditLog.username == username)

    query = query.limit(limit).offset(offset)
    res = await db.execute(query)
    logs = res.scalars().all()

    output = []
    for log in logs:
        output.append({
            "id": log.id,
            "username": log.username,
            "ip_address": str(log.ip_address) if log.ip_address else "127.0.0.1",
            "module": log.module,
            "action": log.action,
            "target_id": log.target_id,
            "details": log.details or {},
            "result": log.result,
            "prev_hash": log.prev_hash,
            "curr_hash": log.curr_hash,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        })

    return {"total": len(output), "items": output}


@router.get("/verify-chain")
async def verify_cryptographic_chain(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("audit:verify"))
):
    """
    Verifica la integridad de la cadena de hashes SHA-256 de la bitácora de auditoría.
    Garantiza el principio de inmutabilidad y no-repudio conforme a ISO 27001 A.8.15.
    """
    verification_result = await verify_audit_chain(db)
    return verification_result
