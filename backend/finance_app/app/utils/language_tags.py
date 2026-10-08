from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.finance_app.app.db.models import WordTag


async def get_language_tags(tag_ids: list[int], language_id: int, user_id: int,
                            session: AsyncSession) -> list[WordTag]:
    """Теги по id — только если все они из этого языка и принадлежат пользователю, иначе 404.

    Без этой проверки к своему слову можно было бы привязать чужой тег или тег другого языка.
    """
    if not tag_ids:
        return []

    unique_ids = set(tag_ids)  # [1, 1] не должно давать две одинаковые связи
    result = await session.execute(
        select(WordTag)
        .where(WordTag.id.in_(unique_ids), WordTag.language_id == language_id, WordTag.user_id == user_id)
    )
    tags = list(result.scalars().all())

    if len(tags) != len(unique_ids):
        missing = sorted(unique_ids - {tag.id for tag in tags})
        raise HTTPException(status_code=404, detail=f"Теги с id {missing} не найдены в этом языке")

    return tags
