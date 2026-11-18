import logging
from datetime import date
from math import ceil
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.finance_app.app.dependencies.auth import get_languages
from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.db.models import ModulesUsers, Language, StudySession, StudyType
from backend.finance_app.app.schemas.common.common import PageNumber, PageSize
from backend.finance_app.app.schemas.languages.study_session import StudySessionPage, StudySessionRead, StudySessionCreate, StudySessionChange
from backend.finance_app.app.utils.check_availability import check_availability


router = APIRouter()

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s - %(name)s - %(asctime)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


async def get_user_study_session(language_id: int, study_id: int, user_id: int,
                                 session: AsyncSession):
    result = await session.execute(
        select(StudySession)
        .where(StudySession.id == study_id, StudySession.language_id == language_id, StudySession.user_id == user_id)
    )
    study = result.scalar_one_or_none()

    if study is None:
        logger.error(f"Занятие с id {study_id} не было найдено")
        raise HTTPException(status_code=404, detail=f"Занятие с id {study_id} не было найдено")

    return study


@router.get("/{language_id}/sessions/", response_model=StudySessionPage, status_code=200)
async def get_study_sessions(language_id: int, page: PageNumber = 1, size: PageSize = 20,
                             date_from: Optional[date] = None, date_to: Optional[date] = None,
                             study_type: Optional[StudyType] = None,
                             user: ModulesUsers = Depends(get_languages), session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    conditions = [StudySession.language_id == language_id, StudySession.user_id == user.user_id]

    if date_from:
        conditions.append(StudySession.study_date >= date_from)
    if date_to:
        conditions.append(StudySession.study_date <= date_to)
    if study_type:
        conditions.append(StudySession.study_type == study_type)

    result = await session.execute(
        select(func.count(), func.coalesce(func.sum(StudySession.minutes), 0))
        .where(*conditions)
    )
    total, total_minutes = result.one()

    result = await session.execute(
        select(StudySession)
        .where(*conditions)
        .order_by(StudySession.study_date.desc(), StudySession.id.desc())
        .offset((page - 1) * size)
        .limit(size)
    )

    return {
        "items": result.scalars().all(),
        "total": total,
        "total_minutes": total_minutes,
        "page": page,
        "size": size,
        "pages": ceil(total / size) if total > 0 else 1,
    }


@router.post("/{language_id}/sessions/", response_model=StudySessionRead, status_code=201)
async def create_study_session(language_id: int, data: StudySessionCreate, user: ModulesUsers = Depends(get_languages),
                               session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    study_session = StudySession(**data.model_dump(), language_id=language_id, user_id=user.user_id)
    session.add(study_session)
    await session.commit()
    return study_session


@router.delete("/{language_id}/sessions/{study_id}/", status_code=204)
async def delete_study_session(language_id: int, study_id: int, user: ModulesUsers = Depends(get_languages),
                               session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    study_session = await get_user_study_session(language_id, study_id, user.user_id, session)
    await session.delete(study_session)
    await session.commit()
    return None


@router.patch("/{language_id}/sessions/{study_id}/", response_model=StudySessionRead, status_code=200)
async def change_study_session(language_id: int, study_id: int,
                               data: StudySessionChange, user: ModulesUsers = Depends(get_languages),
                               session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    study_session = await get_user_study_session(language_id, study_id, user.user_id, session)

    updated_data = data.model_dump(exclude_unset=True)

    for field, value in updated_data.items():
        setattr(study_session, field, value)

    await session.commit()
    await session.refresh(study_session)
    return study_session


@router.get("/{language_id}/sessions/{study_id}/", response_model=StudySessionRead, status_code=200)
async def get_study_session(language_id: int, study_id: int,
                            user: ModulesUsers = Depends(get_languages),
                            session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    study_session = await get_user_study_session(language_id, study_id, user.user_id, session)
    return study_session
