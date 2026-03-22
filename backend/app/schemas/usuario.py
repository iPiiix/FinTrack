from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Optional

class UsuarioBase(BaseModel):
    nombre: str
    apellidos: str
    email: EmailStr
    fecha_nacimiento: date

class UsuarioCreate(UsuarioBase):
    contrasena: str = Field(..., min_length=8, max_length=128)
    turnstile_token: Optional[str] = None # Optional for backward compatibility, but enforced in route if keys are set


class UsuarioResponse(UsuarioBase):
    id_usuario: int
    creado_en: datetime
    subscription_tier: str
    subscription_status: str
    trial_ends_at: Optional[datetime]


    class Config:
        from_attributes = True