from typing import Optional

from pydantic import BaseModel, ConfigDict

from backend.finance_app.app.schemas.common.common import forbid_null


class TagCreate(BaseModel):
    name: str


class TagChange(BaseModel):
    name: Optional[str] = None

    check_not_null = forbid_null("name")


class TagRead(BaseModel):
    id: int
    name: str
    language_id: int

    model_config = ConfigDict(from_attributes=True)