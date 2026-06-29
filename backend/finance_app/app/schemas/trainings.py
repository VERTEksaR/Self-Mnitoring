from datetime import date
from typing import Optional, List

from pydantic import BaseModel, ConfigDict

from backend.finance_app.app.schemas.exercises import ExerciseTrainingReadFull


class TrainingCreate(BaseModel):
    name: str
    date: date


class TrainingChange(BaseModel):
    name: Optional[str] = None
    date: Optional[date] = None


class TrainingRead(BaseModel):
    id: int
    name: str
    date: date
    user_id: int
    training_exercises: List[ExerciseTrainingReadFull] = []
    model_config = ConfigDict(from_attributes=True)