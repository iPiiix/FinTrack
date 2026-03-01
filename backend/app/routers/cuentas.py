from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.cuenta import Cuenta
from app.schemas.cuenta import CuentaCreate, CuentaResponse
from app.models.usuario import Usuario
from app.routers.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=CuentaResponse, status_code=201)
def crear_cuenta(
    cuenta: CuentaCreate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    nueva_cuenta = Cuenta(
        **cuenta.model_dump(),
        id_usuario=current_user.id_usuario
    )
    db.add(nueva_cuenta)
    db.commit()
    db.refresh(nueva_cuenta)
    return nueva_cuenta

@router.get("/", response_model=List[CuentaResponse])
def obtener_mis_cuentas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    cuentas = db.query(Cuenta).filter(Cuenta.id_usuario == current_user.id_usuario).all()
    return cuentas