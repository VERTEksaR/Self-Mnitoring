from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import  JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.finance_app.app.core.config import settings
from backend.finance_app.app.db.models import User, TelegramUser
from backend.finance_app.app.db.session import get_session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_session)):
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        print(payload)
        user_id = payload.get("sub")
        app_id = payload.get("app")

        if not user_id:
            raise HTTPException(
                status_code=401, detail="Invalid token"
            )
    except JWTError:
        raise HTTPException(
            status_code=401, detail="Invalid token"
        )
    print(type(app_id), type(user_id))

    if app_id == '1':
        result = await session.execute(
            select(User).where(User.id == int(user_id))
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=401, detail="User not found"
            )
    elif app_id == '2':
        print(11, user_id)

        tg_user_result = await session.execute(
            select(TelegramUser).where(TelegramUser.telegram_id == user_id)
        )
        tg_user = tg_user_result.scalar_one_or_none()
        print(22, tg_user)

        if not tg_user:
            raise HTTPException(status_code=401, detail="User not found")

        result = await session.execute(
            select(User).where(User.id == tg_user.user_id)
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=401, detail="User not found"
            )
    else:
        raise HTTPException(status_code=401, detail="User not found")

    return user