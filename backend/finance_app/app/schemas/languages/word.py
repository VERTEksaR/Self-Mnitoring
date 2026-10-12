from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from backend.finance_app.app.db.models import PartOfSpeech
from backend.finance_app.app.schemas.common.common import forbid_null
from backend.finance_app.app.schemas.languages.tag import TagRead


class WordCreate(BaseModel):
    word: str
    translation: str
    transcription: Optional[str] = None
    part_of_speech: Optional[PartOfSpeech] = None
    example: Optional[str] = None
    note: Optional[str] = None
    tag_ids: list[int] = []


class WordChange(BaseModel):
    word: Optional[str] = None
    translation: Optional[str] = None
    transcription: Optional[str] = None
    part_of_speech: Optional[PartOfSpeech] = None
    example: Optional[str] = None
    note: Optional[str] = None
    tag_ids: list[int] = []

    check_not_null = forbid_null("word", "translation", "tag_ids")


class WordRead(BaseModel):
    id: int
    word: str
    translation: str
    transcription: Optional[str] = None
    part_of_speech: Optional[PartOfSpeech] = None
    example: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime
    box: int
    next_review_date: Optional[date] = None
    language_id: int
    user_id: int
    tags: list[TagRead] = []

    model_config = ConfigDict(from_attributes=True)
