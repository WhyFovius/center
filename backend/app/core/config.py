import os
from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ShieldOps API"
    api_prefix: str = "/api/v1"
    environment: str = "development"
    debug: bool = False

    secret_key: str = Field(default_factory=lambda: os.environ.get("SECRET_KEY", ""))
    access_token_expire_minutes: int = 24 * 60
    jwt_algorithm: str = "HS256"

    postgres_user: str = "shieldops"
    postgres_password: str = "shieldops"
    postgres_db: str = "shieldops"
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    database_url_from_env: str | None = Field(default=None, alias="DATABASE_URL")

    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_password: str | None = None

    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    def validate(self) -> None:
        if not self.secret_key:
            raise ValueError(
                "SECRET_KEY environment variable must be set. "
                "Generate one with: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
            )

    @property
    def database_url(self) -> str:
        if self.database_url_from_env:
            return self.database_url_from_env
        return (
            f"postgresql+psycopg2://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def redis_url(self) -> str:
        auth_part = ""
        if self.redis_password:
            auth_part = f":{self.redis_password}@"
        return f"redis://{auth_part}{self.redis_host}:{self.redis_port}/{self.redis_db}"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
settings.validate()
