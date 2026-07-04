from typing import Optional

from pydantic import BaseModel, ConfigDict


class CategoryCreate(BaseModel):
    name: str
    show_analytics: bool = True


class CategoryRead(BaseModel):
    id: int
    name: str
    user_id: int
    show_analytics: bool


class CategoryChange(BaseModel):
    name: Optional[str] = None
    show_analytics: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)

