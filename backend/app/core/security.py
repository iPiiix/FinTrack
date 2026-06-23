from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings
import secrets


pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def verificar_password(password_plano: str, password_hash: str) -> bool:
    return pwd_context.verify(password_plano, password_hash)

def hashear_password(password: str) -> str:
    return pwd_context.hash(password)

def crear_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    datos = data.copy()
    if expires_delta:
        expira = datetime.now(timezone.utc) + expires_delta
    else:
        expira = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
        
    datos.update({"exp": expira})
    return jwt.encode(
        datos,
        settings.secret_key,
        algorithm=settings.algorithm
    )

def crear_refresh_token() -> str:
    """Generates a secure random string for use as a refresh token."""
    return secrets.token_urlsafe(64)

def verificar_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )
        return payload
    except JWTError:
        return None