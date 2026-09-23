import os
from typing import List

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    class Settings(BaseSettings):
        PROJECT_NAME: str = "VOCX AI - Customer Intelligence Platform"
        API_V1_STR: str = "/api/v1"
        SECRET_KEY: str = "vocx-ai-super-secret-jwt-key-production-grade-2026"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
        DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./vocx_ai.db")
        ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
        LOG_LEVEL: str = "INFO"

        model_config = SettingsConfigDict(
            env_file=".env",
            env_file_encoding="utf-8",
            extra="ignore"
        )

        @property
        def cors_origins(self) -> List[str]:
            if isinstance(self.ALLOWED_ORIGINS, str):
                return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
            return ["*"]
except ImportError:
    class Settings:
        PROJECT_NAME: str = os.getenv("PROJECT_NAME", "VOCX AI - Customer Intelligence Platform")
        API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
        SECRET_KEY: str = os.getenv("SECRET_KEY", "vocx-ai-super-secret-jwt-key-production-grade-2026")
        ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
        DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./vocx_ai.db")
        ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
        LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

        @property
        def cors_origins(self) -> List[str]:
            if isinstance(self.ALLOWED_ORIGINS, str):
                return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
            return ["*"]


settings = Settings()
