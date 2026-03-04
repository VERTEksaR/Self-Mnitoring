from pydantic import BaseModel, ConfigDict


class AccountCreate(BaseModel):
    name: str
    user_id: int


class AccountRead(BaseModel):
    id: int
    name: str
    user_id: int

    model_config = ConfigDict(from_attributes=True)