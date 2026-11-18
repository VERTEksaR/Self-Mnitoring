import datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict

from backend.finance_app.app.schemas.common.common import forbid_null
from backend.finance_app.app.schemas.trainings.exercises import ExerciseTrainingReadFull


class TrainingCreate(BaseModel):
    name: str
    date: datetime.date


class TrainingChange(BaseModel):
    name: Optional[str] = None
    date: Optional[datetime.date] = None

    check_not_null = forbid_null("name", "date")


class TrainingRead(BaseModel):
    id: int
    name: str
    date: datetime.date
    user_id: int
    training_exercises: List[ExerciseTrainingReadFull] = []
    model_config = ConfigDict(from_attributes=True)