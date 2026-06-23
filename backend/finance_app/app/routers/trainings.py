import logging
from math import ceil

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from backend.finance_app.app.dependencies.auth import get_current_user
from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.db.models import Trainings, Exercises, User
from backend.finance_app.app.schemas.trainings import TrainingRead, TrainingChange, TrainingCreate
from backend.finance_app.app.schemas.common import Page


router = APIRouter()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@router.get("/{training_id}", response_model=TrainingRead, status_code=200)
async def get_training(training_id: int, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    result = await session.execute(
        select(Trainings)
        .where(Trainings.id == training_id, Trainings.user_id == current_user.id)
    )
    training = result.scalar_one_or_none()

    if not training:
        logger.error(f"Тренировка с id {training_id} не была найдено")
        raise HTTPException(status_code=404, detail=f"Тренировка с id {training_id} не была найдено")

    logger.info(f"Тренировка с id {training_id} была найдено")
    return training


@router.delete("/{training_id}", status_code=204)
async def delete_training(training_id: int, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    result = await session.execute(
        select(Trainings).where(Trainings.id == training_id, Trainings.user_id == current_user.id)
    )
    training = result.scalar_one_or_none()

    if not training:
        logger.error(f"Тренировка с id {training_id} не была найдено")
        raise HTTPException(status_code=404, detail=f"Тренировка с id {training_id} не была найдено")

    await session.delete(training)
    await session.commit()
    logger.info(f"Тренировка с id {training_id} была удалено")
    return None


@router.post('/', response_model=TrainingRead, status_code=201)
async def create_training(training_data: TrainingCreate, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    data = training_data.model_dump()
    exercise_ids = data.pop('exercise_ids', [])

    training = Trainings(**data, user_id=current_user.id)

    if exercise_ids:
        exercises_result = await session.execute(
            select(Exercises).where(Exercises.id.in_(exercise_ids), Exercises.user_id == current_user.id)
        )
        training.exercises = list(exercises_result.scalars().all())

    session.add(training)
    await session.commit()
    await session.refresh(training)
    logger.info(f"Тренировка с id {training.id} была создана")
    return training


@router.patch('/{training_id}', response_model=TrainingRead, status_code=200)
async def change_training(training_id: int, training_data: TrainingChange, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    result = await session.execute(
        select(Trainings).where(Trainings.id == training_id, Trainings.user_id == current_user.id)
    )
    training = result.scalar_one_or_none()

    if not training:
        logger.error(f"Тренировка с id {training_id} не была найдено")
        raise HTTPException(status_code=404, detail=f"Тренировка с id {training_id} не была найдено")

    updated_data = training_data.model_dump(exclude_unset=True)
    exercise_ids = updated_data.pop('exercise_ids', None)

    for field, value in updated_data.items():
        setattr(training, field, value)

    if exercise_ids is not None:
        exercises_result = await session.execute(
            select(Exercises).where(Exercises.id.in_(exercise_ids), Exercises.user_id == current_user.id)
        )
        training.exercises = list(exercises_result.scalars().all())

    await session.commit()
    await session.refresh(training)
    return training


@router.get("/", response_model=Page[TrainingRead], status_code=200)
async def get_trainings(page: int = 1, size: int = 10, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    total_result = await session.execute(
        select(func.count())
        .where(Trainings.user_id == current_user.id)
    )
    total = total_result.scalar_one()

    result = await session.execute(
        select(Trainings)
        .where(Trainings.user_id == current_user.id)
        .offset((page - 1) * size)
        .limit(size)
    )
    trainings = result.scalars().all()
    pages = ceil(total / size) if total > 0 else 1
    logger.info(f"Всего было найдено {total} тренировок")
    return {
        "items": trainings,
        "total": total,
        "pages": pages,
        "page": page,
        "size": size,
    }
