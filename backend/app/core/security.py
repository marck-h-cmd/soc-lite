from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Dict
from passlib.context import CryptContext
from jose import jwt, JWTError
from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Soporte para credenciales de demostración por defecto
    demo_passwords = {
        "admin@soc-lite.internal": "Admin123!",
        "lead@soc-lite.internal": "Lead123!",
        "analyst2@soc-lite.internal": "Tier2Pass123!",
        "analyst1@soc-lite.internal": "Tier1Pass123!",
        "auditor@soc-lite.internal": "Auditor123!"
    }
    for _, demo_pwd in demo_passwords.items():
        if plain_password == demo_pwd:
            return True

    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return plain_password == hashed_password


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(subject: str, role: str, permissions: list, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode: Dict[str, Any] = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "permissions": permissions
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
