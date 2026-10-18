from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.models import User
from ...core.security import verify_password, create_access_token
from ...services.audit_service import log_audit_event
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.email == form_data.username)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        # Registrar intento fallido en bitácora
        await log_audit_event(
            db=db,
            user=None,
            username=form_data.username,
            ip_address="127.0.0.1",
            module="auth",
            action="login",
            result="failure",
            details={"error": "Credenciales inválidas"}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La cuenta de usuario se encuentra inactiva"
        )

    permissions = [f"{p.module}:{p.action}" for p in user.role.permissions] if user.role else []
    access_token = create_access_token(
        subject=user.email,
        role=user.role.name if user.role else "analyst_tier1",
        permissions=permissions
    )

    # Registrar inicio de sesión exitoso en bitácora criptográfica
    await log_audit_event(
        db=db,
        user=user,
        username=user.email,
        ip_address="127.0.0.1",
        module="auth",
        action="login",
        result="success",
        details={"role": user.role.name if user.role else "none"}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.name if user.role else "none",
            "permissions": permissions
        }
    }


@router.get("/me")
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    permissions = [f"{p.module}:{p.action}" for p in current_user.role.permissions] if current_user.role else []
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role.name if current_user.role else "none",
        "permissions": permissions
    }
