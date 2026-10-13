from typing import Optional

from pydantic import BaseModel, ConfigDict

from backend.finance_app.app.db.models import MuscleGroup, ExerciseType
from backend.finance_app.app.schemas.common.common import forbid_null


class ExerciseCreate(BaseModel):
    name: str
    muscle_group: MuscleGroup
    exercise_type: ExerciseType


class ExerciseChange(BaseModel):
    name: Optional[str] = None
    muscle_group: Optional[MuscleGroup] = None
    exercise_type: Optional[ExerciseType] = None

    check_not_null = forbid_null("name", "muscle_group", "exercise_type")


class ExerciseRead(BaseModel):
    id: int
    name: str
    user_id: int
    muscle_group: MuscleGroup
    exercise_type: ExerciseType

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