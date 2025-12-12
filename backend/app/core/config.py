# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from urllib.parse import quote_plus

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "BarberHair"
    ENV: str = "dev"
    SECRET_KEY: str = Field(...)

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    POSTGRES_HOST: str = Field(...)
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = Field(...)
    POSTGRES_USER: str = Field(...)
    POSTGRES_PASSWORD: str = Field(...)

    SHOP_OPEN: str = "10:00"
    SHOP_CLOSE: str = "20:00"
    BREAK_START: str = "13:00"
    BREAK_END: str = "14:00"

    SLOT_MINUTES: int = 15
    BOOK_AHEAD_DAYS: int = 1
    CANCEL_BEFORE_HOURS: int = 2

    @property
    def DATABASE_URL(self) -> str:
        pw = quote_plus(self.POSTGRES_PASSWORD)
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{pw}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

settings = Settings()
