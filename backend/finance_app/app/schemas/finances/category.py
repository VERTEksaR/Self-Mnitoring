from typing import Optional

from pydantic import BaseModel, ConfigDict
from backend.finance_app.app.schemas.common.common import forbid_null


class CategoryCreate(BaseModel):
    name: str
    show_analytics: bool = True


class CategoryRead(BaseModel):
    id: int
    name: str
    user_id: int
    show_analytics: bool

    model_config = ConfigDict(from_attributes=True)


class CategoryChange(BaseModel):
    name: Optional[str] = None
    show_analytics: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)
    check_not_null = forbid_null("name", "show_analytics")

