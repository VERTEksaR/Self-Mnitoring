from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.db.models import User
from backend.finance_app.app.schemas.user import UserLogin, UserCreate, UserRead, Token
from backend.finance_app.app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=201)
async def register_user(user_data: UserCreate, session: AsyncSession = Depends(get_session)):
    is_user_new = await session.execute(
        select(User).where(User.email == user_data.email)
    )
    is_user = is_user_new.scalar_one_or_none()

    if is_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        nickname=user_data.nickname,
        is_admin=user_data.is_admin,
        telegram_id=user_data.telegram_id,
    )
    session.add(new_user)
    await session.commit()
    return new_user


@router.post("/login", response_model=Token, status_code=200)
async def login_user(user_data: UserLogin, session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(User).where(User.email == user_data.email)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=401, detail="Wrong email or password")

    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Wrong email or password")

    access_token = create_access_token({'sub': user.email})
    return {'access_token': access_token, 'token_type': 'bearer'}