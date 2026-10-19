from typing import Optional, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.models import User, Role
from ...core.security import get_password_hash
from ...services.audit_service import log_audit_event
from ..deps import get_db, get_current_user, require_permission

router = APIRouter(prefix="/users", tags=["Usuarios"])


class UserCreateSchema(BaseModel):
    email: str = Field(..., pattern=r"^[^@]+@[^@]+\.[^@]+$", description="Correo electrónico válido")
    full_name: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    role_id: int


@router.get("/")
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users:read"))
):
    stmt = select(User).order_by(User.created_at.asc())
    res = await db.execute(stmt)
    users = res.scalars().all()

    output = []
    for u in users:
        output.append({
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role.name if u.role else "none",
            "role_id": u.role_id,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None
        })
    return output


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users:manage"))
):
    stmt_exist = select(User).where(User.email == payload.email)
    res_exist = await db.execute(stmt_exist)
    if res_exist.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El correo electrónico ya se encuentra registrado")

    stmt_role = select(Role).where(Role.id == payload.role_id)
    res_role = await db.execute(stmt_role)
    role = res_role.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=404, detail="Rol especificado inexistente")

    new_user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
        role_id=role.id,
        is_active=True
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Auditoría
    await log_audit_event(
        db=db,
        user=current_user,
        username=current_user.email,
        ip_address="127.0.0.1",
        module="users",
        action="create",
        target_id=str(new_user.id),
        details={"email": new_user.email, "role": role.name}
    )

    return {"message": "Usuario creado satisfactoriamente", "id": str(new_user.id)}
