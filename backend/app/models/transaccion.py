from sqlalchemy import Column, BigInteger, String, Numeric, TIMESTAMP, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class EstadoTransaccion(enum.Enum):
    pendiente = "pendiente"
    completada = "completada"
    fallida = "fallida"

class TipoTransaccion(enum.Enum):
    ingreso = "ingreso"
    gasto = "gasto"
    transferencia = "transferencia"

class Transaccion(Base):
    __tablename__ = "transacciones"

    id_transaccion = Column(BigInteger, primary_key=True, index=True)
    cantidad = Column(Numeric(15, 2), nullable=False)
    tipo = Column(Enum(TipoTransaccion, name="tipo_transaccion", create_type=False), nullable=False)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(String(500))
    estado = Column(Enum(EstadoTransaccion, name="estado_transaccion", create_type=False), nullable=False, default="pendiente")
    fecha = Column(TIMESTAMP, server_default=func.now())
    creado_en = Column(TIMESTAMP, server_default=func.now())

    id_cuenta = Column(BigInteger, ForeignKey("cuenta.id_cuenta"), nullable=False)
    id_categoria = Column(BigInteger, ForeignKey("categoria.id_categoria"), nullable=True)

    cuenta = relationship("Cuenta", back_populates="transacciones")
    categoria = relationship("Categoria", back_populates="transacciones")
