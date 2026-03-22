from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from app.core.security import verificar_token 
from datetime import datetime, timedelta, timezone
from typing import Optional

# This keeps Swagger working
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def get_current_user(
    request: Request,
    db: Session = Depends(get_db), 
    token_header: Optional[str] = Depends(oauth2_scheme)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sesión expirada o inválida",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Dual-auth transition: Check cookie first, then header
    token = request.cookies.get("access_token") or token_header
    
    if not token:
        raise credentials_exception
        
    # 1. Verificamos que el token sea criptográficamente válido
    payload = verificar_token(token)
    if payload is None:
        raise credentials_exception
        
    # 2. Extraemos el ID del usuario del token
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
        
    # 3. Buscamos al usuario en la base de datos
    user = db.query(Usuario).filter(Usuario.id_usuario == int(user_id)).first()
    if user is None:
        raise credentials_exception
        
    return user

def get_active_subscription(current_user: Usuario = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    
    if current_user.subscription_status == 'active':
        return current_user
        
    if current_user.trial_ends_at:
        # 1-hour grace period
        if now < (current_user.trial_ends_at + timedelta(hours=1)):
            return current_user
            
    raise HTTPException(
        status_code=status.HTTP_402_PAYMENT_REQUIRED,
        detail="Suscripción inactiva o periodo de prueba expirado"
    )