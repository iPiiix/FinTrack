import os
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Field names matching the common environment variables
    database_url: str = Field(..., alias="DATABASE_URL")
    secret_key: str = Field(..., alias="SECRET_KEY")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 43200 # Set to 30 days to effectively disable session closed
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
        """Render uses postgres:// but SQLAlchemy 2.x requires postgresql://"""
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

# Debug: Print environment presence (not values) for Render logs
if os.getenv("RENDER"):
    print(f"--- RENDER ENVIRONMENT DETECTED ---")
    print(f"DATABASE_URL present: {bool(os.getenv('DATABASE_URL'))}")
    print(f"SECRET_KEY present: {bool(os.getenv('SECRET_KEY'))}")

try:
    settings = Settings()
except Exception as e:
    print(f"--- SETTINGS LOAD ERROR ---")
    print(f"Details: {e}")
    # In production, we might want to provide a dummy settings object 
    # just to let the process start and show these prints in the logs
    if os.getenv("RENDER"):
        # Create a dummy object with required fields to prevent crash if possible
        # but let's see the error first.
        raise e
    raise e