from datetime import date
from fastapi import Query
from typing import Optional, List, Annotated

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