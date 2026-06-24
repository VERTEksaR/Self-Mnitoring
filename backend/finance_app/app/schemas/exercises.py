from typing import Optional

from pydantic import BaseModel, ConfigDict


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
    weight: Optional[float] = None


class ExerciseTrainingChange(BaseModel):
    quantity: Optional[int] = None
    weight: Optional[float] = None


class ExerciseTrainingRead(BaseModel):
    id: int
    training_id: int
    exercise_id: int
    quantity: Optional[int] = None
    weight: Optional[float] = None
    model_config = ConfigDict(from_attributes=True)


class ExerciseTrainingReadFull(BaseModel):
    id: int
    exercise_id: int
    exercise: ExerciseRead
    quantity: Optional[int] = None
    weight: Optional[float] = None
    model_config = ConfigDict(from_attributes=True)