from sqlalchemy import Column, BigInteger, String, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Categoria(Base):
    __tablename__ = "categoria"

    id_categoria = Column(BigInteger, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    id_usuario = Column(BigInteger, ForeignKey("usuarios.id_usuario"), nullable=True)
    creado_en = Column(TIMESTAMP, server_default=func.now())

    usuario = relationship("Usuario", back_populates="categorias")
    transacciones = relationship("Transaccion", back_populates="categoria")