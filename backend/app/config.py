from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    smtp_email: str = ""
    smtp_password: str = ""
    admin_email: str = ""
    frontend_url: str = "http://localhost:3000"
    admin_panel_user: str = "admin"
    admin_panel_password: str = ""
    admin_panel_secret: str = ""

    @property
    def effective_database_url(self) -> str:
        """Render uses postgres:// but SQLAlchemy 2.x requires postgresql://"""
        url = self.database_url
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    class Config:
        env_file = ".env"

settings = Settings()