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
    steam_openid_url: str
    steam_api_key: str
    base_url: str
    return_steam_url: str
    steam_profile_info_url: str
    steam_profile_games_url: str
    steam_profile_recent_games: str
    steam_profile_games_achievements: str
    redis_host: str = "localhost"
    redis_port: int = 6379

    model_config = SettingsConfigDict(
        env_file=ENV_PATH,
        env_file_encoding='utf-8',
        extra="ignore",
    )

    @computed_field
    @property
    def database_url(self) -> str:
        return f"postgresql+asyncpg://{self.db_username}:{self.password}@{self.host}:{self.port}/{self.database}"

settings = Settings()
