from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.db.models import User, TelegramUser
from backend.finance_app.app.schemas.user import UserLogin, UserCreate, Token
from backend.finance_app.app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)

router = APIRouter()


@router.post("/register", status_code=201)
async def register_user(
    user_data: UserCreate,
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Такая почта уже зарегистрирована"
        )

    new_user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        nickname=user_data.nickname,
        is_admin=user_data.is_admin,
    )

    session.add(new_user)
    await session.flush()

    if user_data.telegram_id:
        telegram_user = TelegramUser(
            telegram_id=user_data.telegram_id,
            user_id=new_user.id,
        )
        session.add(telegram_user)

    await session.commit()

    return new_user


@router.post("/login", response_model=Token)
async def login_user(
    user_data: UserLogin,
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(
        select(User).where(User.email == user_data.email)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(
        user_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Неверная почта или пароль"
        )

    access_token = create_access_token({
        "sub": str(user.id)
    })

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }