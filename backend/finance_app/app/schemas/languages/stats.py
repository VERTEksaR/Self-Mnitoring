from datetime import date
from typing import Optional

from pydantic import BaseModel

from backend.finance_app.app.db.models import StudyType


class WeekStat(BaseModel):
    week: date
    words_added: int
    words_learned: int
    reviews: int
    remembered: int
    minutes: int


class TypeMinutes(BaseModel):
    study_type: StudyType
    minutes: int


class LanguageStats(BaseModel):
    total_words: int
    learned_words: int
    due_today: int
    streak_days: int
    period_reviews: int
    period_accuracy: Optional[int] = None
    period_minutes: int
    weeks: list[WeekStat]
    minutes_by_type: list[TypeMinutes]
