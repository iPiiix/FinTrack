from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.transaccion import TipoTransaccion, EstadoTransaccion

class TransaccionBase(BaseModel):
    cantidad: float
    tipo: TipoTransaccion
    nombre: str
    descripcion: Optional[str] = None
    estado: EstadoTransaccion = EstadoTransaccion.pendiente
    id_categoria: Optional[int] = None

class TransaccionCreate(TransaccionBase):
    id_cuenta: int

class TransaccionResponse(TransaccionBase):
    id_transaccion: int
    fecha: datetime
    creado_en: datetime
    id_cuenta: int

    class Config:
        from_attributes = True