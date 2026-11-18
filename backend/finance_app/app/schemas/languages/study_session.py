from datetime import date, datetime
from typing import Optional, Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator

from backend.finance_app.app.db.models import StudyType
from backend.finance_app.app.schemas.common.common import forbid_null

Minutes = Annotated[int, Field(gt=0, le=24 * 60)]


def not_in_future(value):
    if value is not None and value > date.today():
        raise ValueError("Дата занятия не может быть в будущем")

    return value


class StudySessionCreate(BaseModel):
    study_date: date
    minutes: Minutes
    study_type: StudyType
    comment: Optional[str] = None

    check_date = field_validator("study_date")(not_in_future)


class StudySessionChange(BaseModel):
    study_date: Optional[date] = None
    minutes: Optional[Minutes] = None
    study_type: Optional[StudyType] = None
    comment: Optional[str] = None

    check_not_null = forbid_null("study_date", "minutes", "study_type")
    check_date = field_validator("study_date")(not_in_future)


class StudySessionRead(BaseModel):
    id: int
    study_date: date
    minutes: int
    study_type: StudyType
    comment: Optional[str] = None
    created_at: datetime
    language_id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class StudySessionPage(BaseModel):
    items: list[StudySessionRead]
    total: int
    total_minutes: int
    page: int
    size: int
    pages: int
