from math import ceil

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from backend.finance_app.app.dependencies.auth import get_current_user
from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.db.models import User
from backend.finance_app.app.schemas.user import UserRead, UserFilter
from backend.finance_app.app.schemas.common import Page

router = APIRouter()


@router.get('/{user_id}', response_model=UserRead, status_code=200)
async def get_user(user_id: int, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    user = await session.get(User, user_id)

    if not user:
        raise HTTPException(status_code=404, detail=f"Пользователь с id {user_id} не был найден")

    return user


@router.get('/', response_model=Page[UserRead], status_code=200)
async def get_users(page: int = 1, size: int = 10, filters: UserFilter = Depends(), session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    conditions = []

    if filters.email:
        conditions.append(User.email.like(f"%{filters.email}%"))

    if filters.is_active:
        conditions.append(User.is_active == filters.is_active)

    total_result = await session.execute(
        select(func.count()).where(*conditions)
    )
    total = total_result.scalar_one()

    result = await session.execute(
        select(User).where(*conditions)
        .offset((page - 1) * size)
        .limit(size)
    )
    users = result.scalars().all()
    pages = ceil(total / size) if total > 0 else 1
    return {
        'items': users,
        'total': total,
        'pages': pages,
        'page': page,
        'size': size,
    }