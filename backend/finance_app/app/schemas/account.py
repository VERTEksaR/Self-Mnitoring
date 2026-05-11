from pydantic import BaseModel, ConfigDict


class AccountCreate(BaseModel):
    name: str


class AccountRead(BaseModel):
    id: int
    name: str
    user_id: int

    model_config = ConfigDict(from_attributes=True)