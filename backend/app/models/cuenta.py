from sqlalchemy import Column, BigInteger, String, Numeric, Boolean, TIMESTAMP, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class TipoCuenta(str, enum.Enum):
    debito = "debito"
    credito = "credito"
    ahorros = "ahorros"
    inversion = "inversion"

class Cuenta(Base):
    __tablename__ = "cuenta"

    id_cuenta = Column(BigInteger, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    tipo = Column(Enum(TipoCuenta, name="tipo_cuenta", create_type=False), nullable=False)
    balance = Column(Numeric(15, 2), nullable=False, default=0.00)
    divisa = Column(String(10), nullable=False, default="EUR")
    activa = Column(Boolean, default=True)
    creado_en = Column(TIMESTAMP, server_default=func.now())
    actualizado_en = Column(TIMESTAMP, server_default=func.now())

    id_usuario = Column(BigInteger, ForeignKey("usuarios.id_usuario"), nullable=False)

    usuario = relationship("Usuario", back_populates="cuentas")
    transacciones = relationship("Transaccion", back_populates="cuenta", foreign_keys="[Transaccion.id_cuenta]")