from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.cuenta import TipoCuenta

class CuentaBase(BaseModel):
    nombre: str
    tipo: TipoCuenta
    balance: float = 0.00
    divisa: str = "EUR"

class CuentaCreate(CuentaBase):
    pass

class CuentaResponse(CuentaBase):
    id_cuenta: int
    activa: bool
    creado_en: datetime
    id_usuario: int

    class Config:
        from_attributes = True