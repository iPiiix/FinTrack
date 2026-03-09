from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ActivoBase(BaseModel):
    ticker: str = Field(..., max_length=50)
    cantidad: float
    precio_compra: float

class ActivoCreate(ActivoBase):
    pass

class ActivoResponse(ActivoBase):
    id_activo: int
    fecha_compra: datetime
    id_usuario: int

    class Config:
        from_attributes = True
