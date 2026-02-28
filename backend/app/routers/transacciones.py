from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.transaccion import Transaccion, TipoTransaccion, EstadoTransaccion
from app.models.cuenta import Cuenta
from app.models.usuario import Usuario
from app.schemas.transaccion import TransaccionCreate, TransaccionResponse
from app.routers.deps import get_current_user

router = APIRouter()

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

    impacto = abs(transaccion.cantidad) 
    
    # ⚠️ OJO AQUÍ: Asegúrate de que el campo en tu base de datos se llame 'balance' o 'saldo_actual'. 
    # En tu schema lo llamaste 'balance', así que usaré 'balance' aquí.
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