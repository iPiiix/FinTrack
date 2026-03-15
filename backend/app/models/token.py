from sqlalchemy import Column, BigInteger, String, TIMESTAMP, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(BigInteger, primary_key=True, index=True)
    id_usuario = Column(BigInteger, ForeignKey("usuarios.id_usuario"), nullable=False)
    token_hash = Column(String(255), unique=True, nullable=False, index=True)
    revoked = Column(Boolean, default=False, server_default="false")
    expires_at = Column(TIMESTAMP, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
