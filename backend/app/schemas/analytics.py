from pydantic import BaseModel
from typing import Optional

class ResumenFinanciero(BaseModel):
    total_ingresos: float
    total_gastos: float
    flujo_caja_neto: float
    tasa_ahorro_pct: float
    patrimonio_neto: float

class RatioLiquidez(BaseModel):
    meses_supervivencia: float
    gasto_mensual_promedio: float
    balance_total: float

class ProyeccionAnual(BaseModel):
    mes: str
    ingresos_proyectados: float
    gastos_proyectados: float
    balance_proyectado: float