from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    SERVICE_NAME: str = "soc-lite-langchain-service"
    SERVICE_PORT: int = 8001
    HOST: str = "0.0.0.0"
    DEBUG: bool = False

    # LLM Settings
    LLM_PROVIDER: str = "ollama"  # 'ollama' or 'openai'
    OLLAMA_BASE_URL: str = "http://ollama:11434"
    OLLAMA_MODEL: str = "llama3:8b"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    LLM_TIMEOUT_SECONDS: float = 6.0

    # Threat Intelligence API Keys (optional; falls back to mock intelligence)
    VIRUSTOTAL_API_KEY: Optional[str] = None
    ABUSEIPDB_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
