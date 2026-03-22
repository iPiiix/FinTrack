from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List

from app.database import get_db
from app.models.categoria import Categoria
from app.models.usuario import Usuario
from app.schemas.categoria import CategoriaCreate, CategoriaResponse
from app.routers.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=CategoriaResponse, status_code=201)
def crear_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    nueva_categoria = Categoria(**categoria.model_dump(), id_usuario=current_user.id_usuario)
    db.add(nueva_categoria)
    db.commit()
    db.refresh(nueva_categoria)
    return nueva_categoria

@router.get("/", response_model=List[CategoriaResponse])
def obtener_categorias(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return db.query(Categoria).filter(
        or_(Categoria.id_usuario == None, Categoria.id_usuario == current_user.id_usuario)
    ).all()