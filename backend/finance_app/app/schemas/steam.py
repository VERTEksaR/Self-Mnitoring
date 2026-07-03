from pydantic import BaseModel, ConfigDict


class SteamUserRead(BaseModel):
    id: int
    steam_id: str
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class SteamUserCreate(BaseModel):
    steam_id: str


class SteamTrackedGameRead(BaseModel):
    app_id: int
    game_name: str

    model_config = ConfigDict(from_attributes=True)


class SteamTrackedGameCreate(BaseModel):
    appid: int

