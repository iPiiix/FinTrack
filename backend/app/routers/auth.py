from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioResponse
from app.core.security import hashear_password, verificar_password, crear_token
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/register", response_model=UsuarioResponse)
def register(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    # Comprobar si el email ya existe
    existe = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    # Crear usuario
    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        apellidos=usuario.apellidos,
        email=usuario.email,
        fecha_nacimiento=usuario.fecha_nacimiento,
        contrasena=hashear_password(usuario.contrasena)
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario


@router.post("/login")
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
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
            "email": usuario.email
        }
    }