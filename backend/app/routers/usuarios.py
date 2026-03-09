from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.routers.deps import get_current_user
from app.models.usuario import Usuario
from app.models.cuenta import Cuenta
from app.models.transaccion import Transaccion
from app.models.activo import Activo
from app.core.security import verificar_password, hashear_password

router = APIRouter()

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

@router.put("/me/password")
def update_password(
    payload: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if not verificar_password(payload.current_password, current_user.contrasena):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta"
        )
    
    current_user.contrasena = hashear_password(payload.new_password)
    db.commit()
    return {"message": "Contraseña actualizada correctamente"}

@router.delete("/me/data")
def wipe_user_data(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # This wipes all user-associated data (Activos, Transacciones, Cuentas)
    # The models have cascade deletes if configured at DB level, but we manually delete to be safe.
    
    # 1. Delete Activos
    db.query(Activo).filter(Activo.id_usuario == current_user.id_usuario).delete()
    
    # 2. Delete Transacciones tied to the user
    db.query(Transaccion).filter(Transaccion.id_usuario == current_user.id_usuario).delete()
    
    # 3. Delete Cuentas
    db.query(Cuenta).filter(Cuenta.id_usuario == current_user.id_usuario).delete()
    
    db.commit()
    
    return {"message": "Todos tus datos financieros han sido eliminados"}
