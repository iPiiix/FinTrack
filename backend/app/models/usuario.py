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
    
    # Subscription & Stripe Data
    stripe_customer_id = Column(String(255), unique=True, nullable=True)
    stripe_subscription_id = Column(String(255), unique=True, nullable=True)
    subscription_tier = Column(String(50), default="free", server_default="free")
    subscription_status = Column(String(50), default="inactive", server_default="inactive")
    trial_ends_at = Column(TIMESTAMP, nullable=True)
    ip_address = Column(String(50), nullable=True)
    
    creado_en = Column(TIMESTAMP, server_default=func.now())
    actualizado_en = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    cuentas = relationship("Cuenta", back_populates="usuario", cascade="all, delete-orphan")
    categorias = relationship("Categoria", back_populates="usuario", cascade="all, delete-orphan")
    activos = relationship("Activo", back_populates="usuario", cascade="all, delete-orphan")