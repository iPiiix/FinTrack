from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verificar_password(password_plano: str, password_hash: str) -> bool:
    return pwd_context.verify(password_plano, password_hash)

def hashear_password(password: str) -> str:
    return pwd_context.hash(password)

def crear_token(data: dict) -> str:
    datos = data.copy()
    expira = datetime.utcnow() + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    datos.update({"exp": expira})
    return jwt.encode(
        datos,
        settings.secret_key,
        algorithm=settings.algorithm
    )

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