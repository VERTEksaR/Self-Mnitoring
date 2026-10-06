from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from backend.finance_app.app.db.models import PartOfSpeech


# language_id приходит из пути /languages/{language_id}/words/, а box и next_review_date
# меняет только логика повторения — поэтому их нет в Create/Change
class WordCreate(BaseModel):
    word: str
    translation: str
    transcription: Optional[str] = None
    part_of_speech: Optional[PartOfSpeech] = None
    example: Optional[str] = None
    note: Optional[str] = None


class WordChange(BaseModel):
    word: Optional[str] = None
    translation: Optional[str] = None
    transcription: Optional[str] = None
    part_of_speech: Optional[PartOfSpeech] = None
    example: Optional[str] = None
    note: Optional[str] = None


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

    model_config = ConfigDict(from_attributes=True)
