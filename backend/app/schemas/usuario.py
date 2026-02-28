from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional

class UsuarioBase(BaseModel):
    nombre: str
    apellidos: str
    email: EmailStr
    fecha_nacimiento: date

class UsuarioCreate(UsuarioBase):
    contrasena: str

class UsuarioResponse(UsuarioBase):
    id_usuario: int
    creado_en: datetime

    class Config:
        from_attributes = True