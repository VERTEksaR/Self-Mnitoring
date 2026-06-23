from datetime import date
from fastapi import Query
from typing import Optional, List, Annotated

from pydantic import BaseModel, ConfigDict

# quantity: Optional[int] = None
# weight: Optional[Decimal] = None

class ExerciseCreate(BaseModel):
    name: str


class ExerciseChange(BaseModel):
    name: Optional[str] = None


class ExerciseRead(BaseModel):
    id: int
    name: str
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class ExerciseTrainingCreate(BaseModel):
    training_id: int
    exercise_id: int
    quantity: Optional[int] = None
    weight: Optional[int] = None


class ExerciseTrainingChange(BaseModel):
    training_id: Optional[int] = None
    exercise_id: Optional[int] = None
    quantity: Optional[int] = None
    weight: Optional[int] = None


class ExerciseTrainingRead(BaseModel):
    id: int
    training_id: int
    exercise_id: int
    quantity: Optional[int] = None
    weight: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)