from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
from app.database import get_db
from app.models.transaccion import Transaccion, TipoTransaccion
from app.models.cuenta import Cuenta
from app.models.usuario import Usuario
from app.schemas.analytics import ResumenFinanciero
from app.routers.deps import get_current_user

router = APIRouter()

@router.get("/summary", response_model=ResumenFinanciero)
def get_financial_summary(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)
    # Use a naive datetime to match the TIMESTAMP (no tz) column in the DB
    start_of_month = datetime(now.year, now.month, 1)

    # 1. Patrimonio Neto: suma de balances de todas las cuentas (siempre actual)
    patrimonio = db.query(func.sum(Cuenta.balance)).filter(
        Cuenta.id_usuario == current_user.id_usuario
    ).scalar() or 0.0

    # 2. Ingresos del mes actual
    ingresos = db.query(func.sum(Transaccion.cantidad)).join(Cuenta).filter(
        Cuenta.id_usuario == current_user.id_usuario,
        Transaccion.tipo == TipoTransaccion.ingreso,
        Transaccion.fecha >= start_of_month
    ).scalar() or 0.0

    # 3. Gastos del mes actual
    gastos = db.query(func.sum(Transaccion.cantidad)).join(Cuenta).filter(
        Cuenta.id_usuario == current_user.id_usuario,
        Transaccion.tipo == TipoTransaccion.gasto,
        Transaccion.fecha >= start_of_month
    ).scalar() or 0.0

    # 4. Flujo de caja y tasa de ahorro (mes actual)
    flujo_caja = float(ingresos) - float(gastos)
    tasa_ahorro = (flujo_caja / float(ingresos) * 100) if ingresos > 0 else 0.0

    return {
        "total_ingresos": float(ingresos),
        "total_gastos": float(gastos),
        "flujo_caja_neto": flujo_caja,
        "tasa_ahorro_pct": round(tasa_ahorro, 2),
        "patrimonio_neto": float(patrimonio)
    }