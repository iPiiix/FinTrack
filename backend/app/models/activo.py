from sqlalchemy import Column, BigInteger, String, Numeric, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Activo(Base):
    __tablename__ = "activo"

    id_activo = Column(BigInteger, primary_key=True, index=True)
    ticker = Column(String(50), nullable=False, index=True)
    cantidad = Column(Numeric(15, 6), nullable=False)
    precio_compra = Column(Numeric(15, 4), nullable=False)
    fecha_compra = Column(TIMESTAMP, server_default=func.now())
    
    id_usuario = Column(BigInteger, ForeignKey("usuarios.id_usuario"), nullable=False)

    usuario = relationship("Usuario", back_populates="activos")
