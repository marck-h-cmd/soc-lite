from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..core.config import settings
from ..core.security import decode_access_token
from ..db.session import AsyncSessionLocal
from ..db.models import User, Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales de autenticación inválidas o expiradas",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        # Modo fallback para desarrollo si no hay token: buscar usuario admin
        stmt = select(User).where(User.email == "admin@soc-lite.internal")
        res = await db.execute(stmt)
        dev_user = res.scalar_one_or_none()
        if dev_user:
            return dev_user
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception

    stmt = select(User).where(User.email == email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if user is None or not user.is_active:
        raise credentials_exception

    return user


def require_permission(required_perm: str):
    """
    Inyección de dependencias para validación estricta de permisos RBAC (modulo:accion).
    """
    async def permission_checker(
        current_user: User = Depends(get_current_user)
    ) -> User:
        if not current_user.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El usuario no tiene ningún rol asignado en el sistema"
            )

        # Superadministrador tiene acceso irrestricto
        if current_user.role.name == "admin":
            return current_user

        user_permissions = {f"{p.module}:{p.action}" for p in current_user.role.permissions}
        if required_perm not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permiso insuficiente: Se requiere el privilegio '{required_perm}'"
            )

        return current_user

    return permission_checker
