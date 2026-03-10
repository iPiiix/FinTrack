from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from decimal import Decimal
from typing import List
from app.database import get_db
from app.models.transaccion import Transaccion, TipoTransaccion
from app.models.cuenta import Cuenta
from app.models.usuario import Usuario
from app.schemas.transaccion import TransaccionCreate, TransaccionResponse
from app.routers.deps import get_current_user

router = APIRouter()


@router.get("/", response_model=List[TransaccionResponse])
def listar_transacciones(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """List all transactions for the current user, sorted by date desc."""
    transacciones = (
        db.query(Transaccion)
        .join(Cuenta, Transaccion.id_cuenta == Cuenta.id_cuenta)
        .filter(Cuenta.id_usuario == current_user.id_usuario)
        .order_by(Transaccion.fecha.desc())
        .all()
    )
    return transacciones


@router.post("/", response_model=TransaccionResponse, status_code=status.HTTP_201_CREATED)
def registrar_transaccion(
    transaccion: TransaccionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    cuenta = db.query(Cuenta).filter(
        Cuenta.id_cuenta == transaccion.id_cuenta,
        Cuenta.id_usuario == current_user.id_usuario
    ).first()

    if not cuenta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La cuenta no existe o no tienes permisos sobre ella"
        )

    impacto = Decimal(str(abs(transaccion.cantidad)))

    if transaccion.tipo == TipoTransaccion.gasto:
        cuenta.balance -= impacto
    else:
        cuenta.balance += impacto

    nueva_transaccion = Transaccion(
        cantidad=transaccion.cantidad,
        tipo=transaccion.tipo,
        nombre=transaccion.nombre,
        descripcion=transaccion.descripcion,
        estado=transaccion.estado,
        id_categoria=transaccion.id_categoria,
        id_cuenta=transaccion.id_cuenta
    )

    db.add(nueva_transaccion)

    try:
        db.commit()
        db.refresh(nueva_transaccion)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error crítico en la operación financiera")

    return nueva_transaccion


@router.delete("/{id_transaccion}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_transaccion(
    id_transaccion: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    transaccion = (
        db.query(Transaccion)
        .join(Cuenta, Transaccion.id_cuenta == Cuenta.id_cuenta)
        .filter(
            Transaccion.id_transaccion == id_transaccion,
            Cuenta.id_usuario == current_user.id_usuario
        )
        .first()
    )

    if not transaccion:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")

    cuenta = db.query(Cuenta).filter(Cuenta.id_cuenta == transaccion.id_cuenta).first()
    
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")

    impacto = Decimal(str(abs(transaccion.cantidad)))

    if transaccion.tipo == TipoTransaccion.gasto:
        cuenta.balance += impacto
    else:
        cuenta.balance -= impacto

    db.delete(transaccion)

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al eliminar la transacción")
    
    return None