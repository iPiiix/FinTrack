import os
import logging
from typing import Optional
from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("fintrack.config")

class Settings(BaseSettings):
    # Use defaults to prevent validation crashes during startup/logs
    database_url: str = Field("missing", validation_alias=AliasChoices("DATABASE_URL", "database_url"))
    secret_key: str = Field("missing", validation_alias=AliasChoices("SECRET_KEY", "secret_key"))
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    smtp_email: str = ""
    smtp_password: str = ""
    admin_email: str = ""
    frontend_url: str = "http://localhost:3000"
    admin_panel_user: str = "admin"
    admin_panel_password: str = ""
    admin_panel_secret: str = ""
    gemini_api_key: str = ""
    
    # Stripe Defaults
    stripe_secret_key: str = ""
    stripe_publishable_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_pro_price_id: str = ""
    stripe_enterprise_price_id: str = ""
    
    # Turnstile Defaults
    turnstile_secret_key: str = ""
    turnstile_site_key: str = ""

    @property
    def effective_database_url(self) -> str:
        if self.database_url == "missing":
            # This will be caught when trying to connect to the DB
            return "postgresql://missing_url_check_env_vars"
            
        url = self.database_url
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        extra="ignore",
        populate_by_name=True
    )

# --- Environment diagnostics for Render ---
if os.getenv("RENDER"):
    logger.info("--- RENDER ENVIRONMENT CHECK ---")
    important_keys = ["DATABASE_URL", "SECRET_KEY", "GEMINI_API_KEY", "PORT"]
    for key in important_keys:
        val = os.getenv(key)
        logger.info(f"{key} is {'PRESENT' if val else 'MISSING'}")
    
    for key in ["database_url", "secret_key"]:
        val = os.getenv(key)
        if val:
            logger.warning(f"Found lowercase {key} in environment")

try:
    settings = Settings()
    if settings.database_url == "missing" or settings.secret_key == "missing":
        logger.warning("SETTINGS LOADED WITH DEFAULT 'missing' VALUES")
        logger.warning(f"DB URL: {settings.database_url}")
        logger.warning(f"Secret Key: {'found' if settings.secret_key != 'missing' else 'missing'}")
except Exception as e:
    logger.critical(f"SETTINGS LOAD ERROR: {e}")
    raise e