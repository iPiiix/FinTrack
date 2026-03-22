from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.routers.deps import get_current_user
from app.models.usuario import Usuario
from app.models.cuenta import Cuenta
from app.models.transaccion import Transaccion
from app.models.activo import Activo
from app.models.token import RefreshToken
from app.core.security import verificar_password, hashear_password

router = APIRouter()

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class NameUpdate(BaseModel):
    nombre: str
    apellidos: str

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

@router.put("/me/name")
def update_name(
    payload: NameUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    current_user.nombre = payload.nombre
    current_user.apellidos = payload.apellidos
    db.commit()
    db.refresh(current_user)
    return current_user


def _delete_user_financial_data(db: Session, user_id: int):
    """Delete all financial data for a user using efficient subqueries."""
    # 1. Delete Activos
    db.query(Activo).filter(Activo.id_usuario == user_id).delete(synchronize_session=False)
    
    # 2. Delete Transacciones via subquery (no N+1)
    cuenta_ids_subq = db.query(Cuenta.id_cuenta).filter(
        Cuenta.id_usuario == user_id
    ).subquery()
    db.query(Transaccion).filter(
        Transaccion.id_cuenta.in_(cuenta_ids_subq)
    ).delete(synchronize_session=False)
    
    # 3. Delete Cuentas
    db.query(Cuenta).filter(Cuenta.id_usuario == user_id).delete(synchronize_session=False)
    
    # 4. Revoke all refresh tokens
    db.query(RefreshToken).filter(RefreshToken.id_usuario == user_id).delete(synchronize_session=False)


@router.delete("/me/data")
def wipe_user_data(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    _delete_user_financial_data(db, current_user.id_usuario)
    db.commit()
    return {"message": "Todos tus datos financieros han sido eliminados"}


@router.delete("/me")
def delete_user_account(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    _delete_user_financial_data(db, current_user.id_usuario)
    db.delete(current_user)
    db.commit()
    return {"message": "Cuenta eliminada correctamente"}
