from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.routers.deps import get_current_user, get_active_subscription
from app.models.usuario import Usuario
from app.models.activo import Activo
from app.schemas.activo import ActivoCreate, ActivoResponse

router = APIRouter()

@router.get("/", response_model=List[ActivoResponse])
def read_activos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Get all user investments (activos).
    """
    return db.query(Activo).filter(Activo.id_usuario == current_user.id_usuario).all()

@router.post("/", response_model=ActivoResponse, status_code=status.HTTP_201_CREATED)
def create_activo(
    activo: ActivoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_active_subscription)
):
    """
    Register a new investment (compra de activo).
    """
    # Transform to uppercase ticker to standardize
    db_activo = Activo(
        ticker=activo.ticker.upper(),
        cantidad=activo.cantidad,
        precio_compra=activo.precio_compra,
        id_usuario=current_user.id_usuario
    )
    db.add(db_activo)
    db.commit()
    db.refresh(db_activo)
    return db_activo

@router.delete("/{id_activo}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activo(
    id_activo: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_active_subscription)
):
    """
    Delete an investment record.
    """
    db_activo = db.query(Activo).filter(
        Activo.id_activo == id_activo, 
        Activo.id_usuario == current_user.id_usuario
    ).first()
    
    if not db_activo:
        raise HTTPException(status_code=404, detail="Activo not found")

    db.delete(db_activo)
    db.commit()
    return None
