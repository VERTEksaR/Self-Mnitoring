import logging
from math import ceil

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from backend.finance_app.app.dependencies.auth import get_current_user
from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.db.models import TrainingExercises, User
from backend.finance_app.app.schemas.exercises import ExerciseTrainingRead, ExerciseTrainingChange, ExerciseTrainingCreate
from backend.finance_app.app.schemas.common import Page


router = APIRouter()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@router.get("/ex_training", response_model=ExerciseTrainingRead, status_code=200)
async def get_ex_training(exercise_id: int = Query(...), training_id: int = Query(...), session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    result = await session.execute(
        select(TrainingExercises)
        .where(TrainingExercises.exercise_id == exercise_id, TrainingExercises.training_id == training_id, TrainingExercises.user_id == current_user.id)
    )
    ex_training = result.scalar_one_or_none()

    if not ex_training:
        logger.error(f"Комбинация упражнения {exercise_id} и тренировки {training_id} не была найдена")
        raise HTTPException(status_code=404, detail=f"Комбинация упражнения {exercise_id} и тренировки {training_id} не была найдена")

    logger.info(f"Комбинация упражнения {exercise_id} и тренировки {training_id} была найдена")
    return ex_training


@router.delete("/ex_training", status_code=204)
async def delete_ex_training(exercise_id: int = Query(...), training_id: int = Query(...), session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    result = await session.execute(
        select(TrainingExercises)
        .where(TrainingExercises.training_id == training_id, TrainingExercises.exercise_id == exercise_id, TrainingExercises.user_id == current_user.id)
    )
    ex_training = result.scalar_one_or_none()

    if not ex_training:
        logger.error(f"Комбинация упражнения {exercise_id} и тренировки {training_id} не была найдена")
        raise HTTPException(status_code=404, detail=f"Комбинация упражнения {exercise_id} и тренировки {training_id} не была найдена")

    await session.delete(ex_training)
    await session.commit()
    logger.error(f"Комбинация упражнения {exercise_id} и тренировки {training_id} была удалена")
    return None


@router.post("/", response_model=ExerciseTrainingRead, status_code=201)
async def create_ex_training(ex_training_data: ExerciseTrainingCreate, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    ex_training = TrainingExercises(**ex_training_data.model_dump(), user_id=current_user.id)
    session.add(ex_training)
    await session.commit()
    await session.refresh(ex_training)
    logger.error(f"Комбинация упражнения {ex_training.exercise_id} и тренировки {ex_training.training_id} была создана")
    return ex_training


@router.patch("/ex_training", response_model=ExerciseTrainingRead, status_code=200)
async def change_ex_training(ex_training_data: ExerciseTrainingChange, exercise_id: int = Query(...), training_id: int = Query(...), session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    result = await session.execute(
        select(TrainingExercises)
        .where(TrainingExercises.training_id == training_id, TrainingExercises.exercise_id == exercise_id, TrainingExercises.user_id == current_user.id)
    )
    ex_training = result.scalar_one_or_none()

    if not ex_training:
        logger.error(f"Комбинация упражнения {exercise_id} и тренировки {training_id} не была найдена")
        raise HTTPException(status_code=404, detail=f"Комбинация упражнения {exercise_id} и тренировки {training_id} не была найдена")

    updated_data = ex_training_data.model_dump(exclude_unset=True)

    for field, value in updated_data.items():
        setattr(ex_training, field, value)

    await session.commit()
    await session.refresh(ex_training)
    return ex_training
