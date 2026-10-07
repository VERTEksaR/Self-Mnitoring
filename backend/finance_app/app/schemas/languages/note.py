from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from backend.finance_app.app.schemas.common.common import forbid_null


class LanguageNoteCreate(BaseModel):
    title: str
    content: str


class LanguageNoteChange(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

    check_not_null = forbid_null("title", "content")


class LanguageNoteRead(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    language_id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)
