from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import computed_field
from pathlib import Path
from dotenv import find_dotenv

ENV_PATH = Path(find_dotenv())

class Settings(BaseSettings):
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    host: str
    port: int
    database: str
    db_username: str
    password: str

    model_config = SettingsConfigDict(
        # env_file='D:\Programming\PTHN\Self-Monitoring\.env',
        env_file=ENV_PATH,
        env_file_encoding='utf-8',
        extra="ignore",
    )

    @computed_field
    @property
    def database_url(self) -> str:
        return f"postgresql+asyncpg://{self.db_username}:{self.password}@{self.host}:{self.port}/{self.database}"

settings = Settings()
