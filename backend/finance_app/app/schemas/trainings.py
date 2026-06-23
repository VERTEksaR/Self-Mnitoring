from datetime import date
from typing import Optional, List

from pydantic import BaseModel, ConfigDict

from backend.finance_app.app.schemas.exercises import ExerciseRead


class TrainingCreate(BaseModel):
    name: str
    date: date
    exercise_ids: List[int] = []


class TrainingChange(BaseModel):
    name: Optional[str] = None
    date: Optional[date] = None
    exercise_ids: Optional[List[int]] = None


class TrainingRead(BaseModel):
    id: int
    name: str
    date: date
    user_id: int
    exercises: List[ExerciseRead] = []

    model_config = ConfigDict(from_attributes=True)
