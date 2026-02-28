from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CategoriaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaResponse(CategoriaBase):
    id_categoria: int
    id_usuario: Optional[int] = None
    creado_en: datetime

    class Config:
        from_attributes = True