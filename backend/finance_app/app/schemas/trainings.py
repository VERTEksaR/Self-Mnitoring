from datetime import date
from decimal import Decimal
from typing import Optional, List

from pydantic import BaseModel, ConfigDict

from backend.finance_app.app.schemas.exercises import ExerciseRead


class TrainingCreate(BaseModel):
    name: str
    quantity: int
    weight: Decimal
    date: date
    exercise_ids: List[int] = []


class TrainingChange(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = None
    weight: Optional[Decimal] = None
    date: Optional[date] = None
    exercise_ids: Optional[List[int]] = None


class TrainingRead(BaseModel):
    id: int
    name: str
    quantity: int
    weight: Decimal
    date: date
    user_id: int
    exercises: List[ExerciseRead] = []

    model_config = ConfigDict(from_attributes=True)
