from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from app.core.security import verificar_token 
from datetime import datetime, timedelta, timezone

# Esto le dice a Swagger dónde está el endpoint de login para el candado
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sesión expirada o inválida",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
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
    now = datetime.utcnow()
    
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