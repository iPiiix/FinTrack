from sqlalchemy import Column, String, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    event_id = Column(String(255), primary_key=True, index=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
