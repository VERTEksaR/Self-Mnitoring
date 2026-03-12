import logging

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.finance_app.app.core.security import create_access_token
from backend.finance_app.app.dependencies.auth import get_current_user
from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.db.models import User, TelegramUser
from backend.finance_app.app.schemas.user import UserRead, UserFilter
from backend.finance_app.app.schemas.common import Page

router = APIRouter()

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s - %(name)s - %(asctime)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@router.get('/', status_code=200)
async def telegram_auth(telegram_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(TelegramUser).where(TelegramUser.telegram_id == str(telegram_id))
    )
    tg_user = result.scalar_one_or_none()

    if not tg_user:
        raise HTTPException(status_code=401, detail="Telegram не привязан")

    access_token = create_access_token({
        "sub": str(tg_user.telegram_id),
    })
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }