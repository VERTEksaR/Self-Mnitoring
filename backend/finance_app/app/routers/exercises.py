import logging
from math import ceil

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from backend.finance_app.app.dependencies.auth import get_current_user
from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.db.models import Exercises, User
from backend.finance_app.app.schemas.exercises import ExerciseRead, ExerciseChange, ExerciseCreate
from backend.finance_app.app.schemas.common import Page


router = APIRouter()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@router.get("/{exercise_id}", response_model=ExerciseRead, status_code=200)
async def get_exercise(exercise_id: int, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    result = await session.execute(
        select(Exercises).where(Exercises.id == exercise_id, Exercises.user_id == current_user.id)
    )
    exercise = result.scalar_one_or_none()

    if not exercise:
        logger.error(f"Упражнение с id {exercise_id} не было найдено")
        raise HTTPException(status_code=404, detail=f"Упражнение с id {exercise_id} не было найдено")

    logger.info(f"Упражнение с id {exercise_id} было найдено")
    return exercise


@router.delete("/{exercise_id}", status_code=204)
async def delete_exercise(exercise_id: int, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    result = await session.execute(
        select(Exercises).where(Exercises.id == exercise_id, Exercises.user_id == current_user.id)
    )
    exercise = result.scalar_one_or_none()

    if not exercise:
        logger.error(f"Упражнение с id {exercise_id} не было найдено")
        raise HTTPException(status_code=404, detail=f"Упражнение с id {exercise_id} не было найдено")

    await session.delete(exercise)
    await session.commit()
    logger.info(f"Упражнение с id {exercise_id} было удалено")
    return None


@router.post('/', response_model=ExerciseRead, status_code=201)
async def create_exercise(exercise_data: ExerciseCreate, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    exercise = Exercises(**exercise_data.model_dump(), user_id=current_user.id)
    session.add(exercise)
    await session.commit()
    await session.refresh(exercise)
    logger.info(f"Упражнение с id {exercise.id} было создано")
    return exercise


@router.patch("/{exercise_id}", response_model=ExerciseRead, status_code=200)
async def change_exercise(exercise_id: int, exercise_data: ExerciseChange, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    result = await session.execute(
        select(Exercises).where(Exercises.id == exercise_id, Exercises.user_id == current_user.id)
    )
    exercise = result.scalar_one_or_none()

    if not exercise:
        logger.error(f"Упражнение с id {exercise_id} не было найдено")
        raise HTTPException(status_code=404, detail=f"Упражнение с id {exercise_id} не было найдено")

    updated_data = exercise_data.model_dump(exclude_unset=True)

    for field, value in updated_data.items():
        setattr(exercise, field, value)

    await session.commit()
    await session.refresh(exercise)
    return exercise


@router.get("/", response_model=Page[ExerciseRead], status_code=200)
async def get_exercises(page: int = 1, size: int = 10, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    total_result = await session.execute(
        select(func.count()).where(Exercises.user_id == current_user.id)
    )
    total = total_result.scalar_one()

    result = await session.execute(
        select(Exercises).where(Exercises.user_id == current_user.id)
        .offset((page - 1) * size)
        .limit(size)
    )
    exercises = result.scalars().all()
    pages = ceil(total / size) if total > 0 else 1
    logger.info(f"Всего было найдено {total} упражнений")
    return {
        'items': exercises,
        "total": total,
        "pages": pages,
        "page": page,
        "size": size,
    }
