import logging
from math import ceil

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from backend.finance_app.app.dependencies.auth import get_trainings
from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.db.models import Trainings, User, ModulesUsers
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
async def get_training(training_id: int, session: AsyncSession = Depends(get_session), current_user: ModulesUsers = Depends(get_trainings)):
    result = await session.execute(
        select(Trainings).where(Trainings.id == training_id, Trainings.user_id == current_user.user_id)
    )
    training = result.scalar_one_or_none()
    if not training:
        raise HTTPException(status_code=404, detail=f"Тренировка {training_id} не найдена")
    return training


@router.delete("/{training_id}", status_code=204)
async def delete_training(training_id: int, session: AsyncSession = Depends(get_session), current_user: ModulesUsers = Depends(get_trainings)):
    result = await session.execute(
        select(Trainings).where(Trainings.id == training_id, Trainings.user_id == current_user.user_id)
    )
    training = result.scalar_one_or_none()
    if not training:
        raise HTTPException(status_code=404, detail=f"Тренировка {training_id} не найдена")
    await session.delete(training)
    await session.commit()
    return None


@router.post("/", response_model=TrainingRead, status_code=201)
async def create_training(training_data: TrainingCreate, session: AsyncSession = Depends(get_session), current_user: ModulesUsers = Depends(get_trainings)):
    training = Trainings(**training_data.model_dump(), user_id=current_user.user_id)
    session.add(training)
    await session.commit()
    await session.refresh(training)
    logger.info(f"Тренировка {training.id} создана")
    return training


@router.patch("/{training_id}", response_model=TrainingRead, status_code=200)
async def change_training(training_id: int, training_data: TrainingChange, session: AsyncSession = Depends(get_session), current_user: ModulesUsers = Depends(get_trainings)):
    result = await session.execute(
        select(Trainings).where(Trainings.id == training_id, Trainings.user_id == current_user.user_id)
    )
    training = result.scalar_one_or_none()
    if not training:
        raise HTTPException(status_code=404, detail=f"Тренировка {training_id} не найдена")

    for field, value in training_data.model_dump(exclude_unset=True).items():
        setattr(training, field, value)

    await session.commit()
    await session.refresh(training)
    return training


@router.get("/", response_model=Page[TrainingRead], status_code=200)
async def get_trainings(page: int = 1, size: int = 10, session: AsyncSession = Depends(get_session), current_user: ModulesUsers = Depends(get_trainings)):
    total = (await session.execute(
        select(func.count()).where(Trainings.user_id == current_user.user_id)
    )).scalar_one()

    trainings = (await session.execute(
        select(Trainings)
        .where(Trainings.user_id == current_user.user_id)
        .offset((page - 1) * size)
        .limit(size)
    )).scalars().all()

    return {
        "items": trainings,
        "total": total,
        "pages": ceil(total / size) if total > 0 else 1,
        "page": page,
        "size": size,
    }