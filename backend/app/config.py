from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = Field(..., validation_alias=AliasChoices("DATABASE_URL", "database_url"))
    secret_key: str = Field(..., validation_alias=AliasChoices("SECRET_KEY", "secret_key"))
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
        case_sensitive=False,
        extra="ignore"
    )

settings = Settings()