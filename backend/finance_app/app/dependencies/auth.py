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
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401, detail="Invalid token"
            )
    except JWTError:
        raise HTTPException(
            status_code=401, detail="Invalid token"
        )

    print(11, user_id)

    tg_user_result = await session.execute(
        select(TelegramUser).where(TelegramUser.telegram_id == str(user_id))
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

    return user