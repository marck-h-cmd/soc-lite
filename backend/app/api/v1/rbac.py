from typing import List, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.models import Role, Permission, User, role_permissions
from ...services.audit_service import log_audit_event
from ..deps import get_db, get_current_user, require_permission

router = APIRouter(prefix="/rbac", tags=["Control de Acceso y Roles (RBAC)"])


class UpdateRolePermissionsSchema(BaseModel):
    permission_ids: List[int] = Field(..., description="Lista de IDs de permisos a asociar al rol")


@router.get("/roles")
async def list_roles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("rbac:read"))
):
    stmt = select(Role).order_by(Role.id.asc())
    res = await db.execute(stmt)
    roles = res.scalars().all()

    output = []
    for r in roles:
        output.append({
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "is_system": r.is_system,
            "permissions": [
                {
                    "id": p.id,
                    "module": p.module,
                    "action": p.action,
                    "slug": f"{p.module}:{p.action}",
                    "description": p.description
                }
                for p in r.permissions
            ]
        })
    return output


@router.get("/permissions")
async def list_permissions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("rbac:read"))
):
    stmt = select(Permission).order_by(Permission.module.asc(), Permission.action.asc())
    res = await db.execute(stmt)
    perms = res.scalars().all()

    grouped: Dict[str, List[Any]] = {}
    for p in perms:
        item = {
            "id": p.id,
            "module": p.module,
            "action": p.action,
            "slug": f"{p.module}:{p.action}",
            "description": p.description
        }
        grouped.setdefault(p.module, []).append(item)

    return {
        "total": len(perms),
        "modules": grouped,
        "items": [
            {
                "id": p.id,
                "module": p.module,
                "action": p.action,
                "slug": f"{p.module}:{p.action}",
                "description": p.description
            }
            for p in perms
        ]
    }


@router.post("/roles/{role_id}/permissions")
async def update_role_permissions(
    role_id: int,
    payload: UpdateRolePermissionsSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("rbac:manage"))
):
    stmt_role = select(Role).where(Role.id == role_id)
    res_role = await db.execute(stmt_role)
    role = res_role.scalar_one_or_none()

    if not role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")

    if role.name == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Los permisos del rol 'admin' son inmutables por política de seguridad"
        )

    # Limpiar asignaciones previas
    del_stmt = delete(role_permissions).where(role_permissions.c.role_id == role.id)
    await db.execute(del_stmt)

    # Insertar nuevas asignaciones
    if payload.permission_ids:
        stmt_perms = select(Permission).where(Permission.id.in_(payload.permission_ids))
        res_perms = await db.execute(stmt_perms)
        valid_perms = res_perms.scalars().all()
        role.permissions = list(valid_perms)

    await db.commit()

    # Registrar en bitácora
    await log_audit_event(
        db=db,
        user=current_user,
        username=current_user.email,
        ip_address="127.0.0.1",
        module="rbac",
        action="update",
        target_id=str(role.id),
        details={"role": role.name, "assigned_permission_count": len(payload.permission_ids)}
    )

    return {"message": f"Permisos del rol '{role.name}' actualizados correctamente", "role_id": role.id}
