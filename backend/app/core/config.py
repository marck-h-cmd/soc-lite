from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "SOC-Lite API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False

    # Base de Datos PostgreSQL
    POSTGRES_SERVER: str = "postgres"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "soc_user"
    POSTGRES_PASSWORD: str = "soc_password"
    POSTGRES_DB: str = "soc_lite_db"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Criptografía y JWT
    SECRET_KEY: str = "soc-lite-super-secret-key-32-chars-long-security-token-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12  # 12 horas

    # Integración con Microservicio LangChain
    LANGCHAIN_SERVICE_URL: str = "http://langchain-service:8001"
    LANGCHAIN_TIMEOUT_SECONDS: float = 10.0

    # Orquestador n8n
    N8N_WEBHOOK_URL: Optional[str] = "http://n8n:5678/webhook/alerts"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
