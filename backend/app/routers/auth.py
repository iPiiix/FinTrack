from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Response, Request, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
import secrets
import httpx
from datetime import datetime, timedelta
from app.database import get_db
from app.models.usuario import Usuario
from app.models.token import RefreshToken
from app.schemas.usuario import UsuarioCreate, UsuarioResponse
from app.core.security import hashear_password, verificar_password, crear_token, crear_refresh_token, hashear_password as hash_token
from app.config import settings
from fastapi.security import OAuth2PasswordRequestForm
from app.routers.deps import get_current_user
import hashlib

router = APIRouter()

class EmailCheck(BaseModel):
    email: str

def get_token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

@router.post("/check-email")
def check_email(payload: EmailCheck, db: Session = Depends(get_db)):
    existe = db.query(Usuario).filter(Usuario.email == payload.email).first()
    return {"exists": existe is not None}

async def verify_turnstile(token: str) -> bool:
    if not settings.turnstile_secret_key:
        return True 
    if not token:
        return False
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": settings.turnstile_secret_key, "response": token}
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
    print(f"--- [DEBUG] Register start for email: {usuario.email} ---")
    existe = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if existe:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
        
    client_ip = request.client.host if request.client else "unknown"
    
    if client_ip != "unknown" and client_ip not in ["127.0.0.1", "::1"]:
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_ip_accounts = db.query(Usuario).filter(
            Usuario.ip_address == client_ip,
            Usuario.creado_en >= thirty_days_ago
        ).count()
        if recent_ip_accounts >= 1:
            raise HTTPException(status_code=403, detail="Límite de creación de cuentas alcanzado.")

    if settings.turnstile_secret_key and not await verify_turnstile(usuario.turnstile_token):
        print("--- [DEBUG] Register: Turnstile verification failed ---")
        raise HTTPException(status_code=400, detail="Verificación Turnstile fallida")

    print(f"--- [DEBUG] Register: Creating user object for {usuario.email} ---")

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
    try:
        db.commit()
        print(f"--- [DEBUG] Register: User {usuario.email} committed successfully ---")
        db.refresh(nuevo_usuario)
    except Exception as e:
        db.rollback()
        print(f"--- [DEBUG] Register: COMMIT ERROR: {e} ---")
        raise HTTPException(status_code=500, detail="Error al guardar el usuario en la base de datos")

    if settings.smtp_email:
        from app.core.email import enviar_verificacion, notificar_admin
        background_tasks.add_task(enviar_verificacion, usuario.email, usuario.nombre, token_verificacion)
        background_tasks.add_task(notificar_admin, usuario.nombre, usuario.apellidos, usuario.email)

    return nuevo_usuario

@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.token_verificacion == token).first()
    if not usuario:
        raise HTTPException(status_code=400, detail="Token inválido")
    usuario.email_verificado = True
    usuario.token_verificacion = None
    db.commit()
    return {"message": "Email verificado"}

@router.post("/login")
    turnstile_token: str = Form(None)
):
    print(f"--- [DEBUG] Login start for email: {form_data.username} ---")
    if settings.turnstile_secret_key and not await verify_turnstile(turnstile_token):
        print("--- [DEBUG] Login: Turnstile verification failed ---")
        raise HTTPException(status_code=400, detail="Verificación Turnstile fallida")

    usuario = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    if not usuario:
        print(f"--- [DEBUG] Login: User {form_data.username} not found ---")
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    if not verificar_password(form_data.password, usuario.contrasena):
        print(f"--- [DEBUG] Login: Password verification failed for {form_data.username} ---")
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    # Tokens
    access_token = crear_token({"sub": str(usuario.id_usuario)})
    refresh_token_plain = crear_refresh_token()
    
    # Save refresh token
    db_refresh = RefreshToken(
        id_usuario=usuario.id_usuario,
        token_hash=get_token_hash(refresh_token_plain),
        expires_at=datetime.utcnow() + timedelta(days=30)
    )
    db.add(db_refresh)
    try:
        db.commit()
        print(f"--- [DEBUG] Login: Refresh token saved for {form_data.username} ---")
    except Exception as e:
        db.rollback()
        print(f"--- [DEBUG] Login: DB ERROR saving refresh token: {e} ---")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

    # Set cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="none", # Required for cross-domain (Render -> Vercel)
        max_age=settings.access_token_expire_minutes * 60
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token_plain,
        httponly=True,
        secure=True,
        samesite="none", # Required for cross-domain
        max_age=30 * 24 * 60 * 60 # 30 days
    )
    print(f"--- [DEBUG] Login: Cookies set for {form_data.username} ---")

    return {
        "usuario": {
            "id": usuario.id_usuario,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "email_verificado": usuario.email_verificado
        }
    }

@router.post("/refresh")
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")
        
    token_hash = get_token_hash(refresh_token)
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash,
        RefreshToken.revoked == False,
        RefreshToken.expires_at > datetime.utcnow()
    ).first()
    
    if not db_token:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    # Rotate: revoke old, create new
    db_token.revoked = True
    
    usuario = db.query(Usuario).filter(Usuario.id_usuario == db_token.id_usuario).first()
    new_access_token = crear_token({"sub": str(usuario.id_usuario)})
    new_refresh_token_plain = crear_refresh_token()
    
    new_db_token = RefreshToken(
        id_usuario=usuario.id_usuario,
        token_hash=get_token_hash(new_refresh_token_plain),
        expires_at=datetime.utcnow() + timedelta(days=30)
    )
    db.add(new_db_token)
    db.commit()
    
    response.set_cookie(key="access_token", value=new_access_token, httponly=True, secure=True, samesite="none", max_age=settings.access_token_expire_minutes*60)
    response.set_cookie(key="refresh_token", value=new_refresh_token_plain, httponly=True, secure=True, samesite="none", max_age=30*24*3600)
    
    return {"status": "refreshed"}

@router.get("/me")
def get_me(current_user: Usuario = Depends(get_current_user)):
    return {
        "id": current_user.id_usuario,
        "nombre": current_user.nombre,
        "email": current_user.email,
        "email_verificado": current_user.email_verificado,
        "subscription_tier": current_user.subscription_tier,
        "subscription_status": current_user.subscription_status
    }

@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        token_hash = get_token_hash(refresh_token)
        db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).update({"revoked": True})
        db.commit()
        
    response.delete_cookie("access_token", httponly=True, secure=True, samesite="none")
    response.delete_cookie("refresh_token", httponly=True, secure=True, samesite="none")
    return {"status": "logged out"}