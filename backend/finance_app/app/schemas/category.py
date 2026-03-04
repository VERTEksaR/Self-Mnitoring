from pydantic import BaseModel, ConfigDict


class CategoryCreate(BaseModel):
    name: str
    user_id: int


class CategoryRead(BaseModel):
    id: int
    name: str
    user_id: int

    model_config = ConfigDict(from_attributes=True)

