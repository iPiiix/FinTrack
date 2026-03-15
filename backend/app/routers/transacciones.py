from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
import csv
import io
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import update
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
    # Ensure account ownership
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
        impacto = -impacto

    nueva_transaccion = Transaccion(
        cantidad=transaccion.cantidad,
        tipo=transaccion.tipo,
        nombre=transaccion.nombre,
        descripcion=transaccion.descripcion,
        estado=transaccion.estado,
        id_categoria=transaccion.id_categoria,
        id_cuenta=transaccion.id_cuenta
    )

    try:
        # Atomic Transaction
        with db.begin_nested():
            # 1. Update account balance using atomic SQL update
            db.execute(
                update(Cuenta)
                .where(Cuenta.id_cuenta == transaccion.id_cuenta)
                .values(balance=Cuenta.balance + impacto)
            )
            # 2. Add transaction record
            db.add(nueva_transaccion)
        
        db.commit()
        db.refresh(nueva_transaccion)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error crítico en la operación financiera")

    return nueva_transaccion


@router.post("/csv", status_code=status.HTTP_201_CREATED)
async def importar_csv(
    file: UploadFile = File(...),
    id_cuenta: int = Form(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.subscription_tier != "enterprise":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="La importación de CSV es una función exclusiva del plan Enterprise."
        )

    cuenta = db.query(Cuenta).filter(
        Cuenta.id_cuenta == id_cuenta,
        Cuenta.id_usuario == current_user.id_usuario
    ).first()

    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta de destino no encontrada")

    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="El archivo debe ser un CSV")

    contents = await file.read()
    decoded = contents.decode('utf-8-sig')
    reader = csv.DictReader(io.StringIO(decoded))
    
    transacciones_db = []
    total_impacto = Decimal("0")
    
    for row in reader:
        try:
            fecha_str = row.get('Fecha', row.get('Date', ''))
            concepto = row.get('Concepto', row.get('Description', row.get('Nombre', 'Sin concepto')))
            monto_str = row.get('Monto', row.get('Amount', row.get('Cantidad', '0')))
            
            if not fecha_str or not monto_str:
                continue
                
            fecha = datetime.strptime(fecha_str, "%Y-%m-%d")
            monto = float(monto_str.replace(',', '.'))
            tipo = TipoTransaccion.ingreso if monto >= 0 else TipoTransaccion.gasto
            
            nueva_transaccion = Transaccion(
                cantidad=abs(monto),
                tipo=tipo,
                nombre=concepto[:255],
                descripcion="Importado desde CSV",
                estado="completada",
                id_cuenta=id_cuenta,
                fecha=fecha
            )
            transacciones_db.append(nueva_transaccion)
            
            impact = Decimal(str(monto))
            total_impacto += impact
                
        except Exception:
            continue

    if not transacciones_db:
         raise HTTPException(status_code=400, detail="No se encontraron transacciones válidas.")

    try:
        with db.begin_nested():
            # Bulk save and atomic balance update
            db.bulk_save_objects(transacciones_db)
            db.execute(
                update(Cuenta)
                .where(Cuenta.id_cuenta == id_cuenta)
                .values(balance=Cuenta.balance + total_impacto)
            )
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al procesar el CSV masivo.")

    return {"message": f"Se han importado {len(transacciones_db)} transacciones exitosamente."}


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

    impacto_reversion = Decimal(str(abs(transaccion.cantidad)))
    if transaccion.tipo == TipoTransaccion.ingreso:
        impacto_reversion = -impacto_reversion

    try:
        with db.begin_nested():
            # 1. Atomic balance reversion
            db.execute(
                update(Cuenta)
                .where(Cuenta.id_cuenta == transaccion.id_cuenta)
                .values(balance=Cuenta.balance + impacto_reversion)
            )
            # 2. Delete transaction
            db.delete(transaccion)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al eliminar la transacción")
    
    return None