from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
import secrets
import httpx
from datetime import datetime, timedelta
from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioResponse
from app.core.security import hashear_password, verificar_password, crear_token
from app.config import settings
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Form, Request

router = APIRouter()


class EmailCheck(BaseModel):
    email: str


@router.post("/check-email")
def check_email(payload: EmailCheck, db: Session = Depends(get_db)):
    existe = db.query(Usuario).filter(Usuario.email == payload.email).first()
    return {"exists": existe is not None}

async def verify_turnstile(token: str) -> bool:
    if not settings.turnstile_secret_key:
        return True # Skip if Turnstile is not configured
        
    if not token:
        return False
        
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={
                "secret": settings.turnstile_secret_key,
                "response": token
            }
        )
        result = response.json()
        return result.get("success", False)

@router.post("/register", response_model=UsuarioResponse)
async def register(
    usuario: UsuarioCreate,
    background_tasks: BackgroundTasks,
    request: Request,
    db: Session = Depends(get_db),
):
    existe = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
        
    client_ip = request.client.host if request.client else "unknown"
    
    # Anti multi-accounting trial abuse logic
    # Check if there is already an account created from this IP in the last 30 days
    if client_ip != "unknown" and client_ip not in ["127.0.0.1", "::1"]:
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_ip_accounts = db.query(Usuario).filter(
            Usuario.ip_address == client_ip,
            Usuario.creado_en >= thirty_days_ago
        ).count()
        
        if recent_ip_accounts >= 1: # Max 1 account per 30 days from same IP
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Se ha alcanzado el límite de creación de cuentas desde esta IP (Prevención de Multicuentas)."
            )

    if settings.turnstile_secret_key and not await verify_turnstile(usuario.turnstile_token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verificación de seguridad fallida (Turnstile)"
        )

    token_verificacion = secrets.token_urlsafe(32)

    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        apellidos=usuario.apellidos,
        email=usuario.email,
        fecha_nacimiento=usuario.fecha_nacimiento,
        contrasena=hashear_password(usuario.contrasena),
        email_verificado=False,
        token_verificacion=token_verificacion,
        trial_ends_at=datetime.utcnow() + timedelta(days=14),
        subscription_tier="free",
        subscription_status="trialing",
        ip_address=client_ip,
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    # Send emails in background so response is instant
    if settings.smtp_email:
        from app.core.email import enviar_verificacion, notificar_admin
        background_tasks.add_task(
            enviar_verificacion, usuario.email, usuario.nombre, token_verificacion
        )
        background_tasks.add_task(
            notificar_admin, usuario.nombre, usuario.apellidos, usuario.email
        )

    return nuevo_usuario


@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.token_verificacion == token).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido o expirado"
        )

    usuario.email_verificado = True
    usuario.token_verificacion = None
    db.commit()
    return {"message": "Email verificado correctamente"}


@router.post("/login")
async def login(
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends(),
    turnstile_token: str = Form(None)
):
    if settings.turnstile_secret_key and not await verify_turnstile(turnstile_token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verificación de seguridad fallida (Turnstile)"
        )

    usuario = db.query(Usuario).filter(Usuario.email == form_data.username).first()

    if not usuario or not verificar_password(form_data.password, usuario.contrasena):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = crear_token({"sub": str(usuario.id_usuario)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": {
            "id": usuario.id_usuario,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "email_verificado": usuario.email_verificado,
        }
    }