from sqlalchemy import Column, BigInteger, String, Date, Text, TIMESTAMP, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(BigInteger, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    contrasena = Column(Text, nullable=False)
    email_verificado = Column(Boolean, default=False, server_default="false")
    token_verificacion = Column(Text, nullable=True)
    creado_en = Column(TIMESTAMP, server_default=func.now())
    actualizado_en = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    cuentas = relationship("Cuenta", back_populates="usuario")
    categorias = relationship("Categoria", back_populates="usuario")