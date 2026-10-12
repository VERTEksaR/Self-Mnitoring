from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession


async def commit_or_conflict(session: AsyncSession, detail: str):
    """Коммит, который при нарушении UniqueConstraint отдаёт 409 вместо 500."""
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail=detail)
