from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def check_availability(model_id: int, user_id: int, model, session: AsyncSession):
    result = await session.execute(
        select(model)
        .where(model.id == model_id, model.user_id == user_id)
    )
    model_result = result.scalar_one_or_none()

    if model_result is None:
        raise HTTPException(status_code=404, detail=f"{model.__name__} с id {model_id} не найден")

    return model_result