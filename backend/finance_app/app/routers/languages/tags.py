import logging

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.finance_app.app.dependencies.auth import get_languages
from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.db.models import ModulesUsers, Language, WordTag
from backend.finance_app.app.schemas.languages.tag import TagRead, TagChange, TagCreate
from backend.finance_app.app.utils.check_availability import check_availability
from backend.finance_app.app.utils.commit import commit_or_conflict


router = APIRouter()

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s - %(name)s - %(asctime)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def normalize_tag_name(name: str) -> str:
    # «  ЕДА » и «еда» — один и тот же тег «Еда»
    return name.strip().lower().capitalize()


async def get_user_tag(language_id: int, tag_id: int, user_id: int, session: AsyncSession) -> WordTag:
    await check_availability(language_id, user_id, Language, session)
    result = await session.execute(
        select(WordTag)
        .where(WordTag.language_id == language_id, WordTag.user_id == user_id, WordTag.id == tag_id)
    )
    tag = result.scalar_one_or_none()

    if not tag:
        logger.error(f"Тега с id {tag_id} не было найдено")
        raise HTTPException(status_code=404, detail=f"Тега с id {tag_id} не было найдено")

    return tag


@router.get("/{language_id}/tags/", response_model=list[TagRead])
async def get_tags(language_id: int, user: ModulesUsers = Depends(get_languages),
                   session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    result = await session.execute(
        select(WordTag)
        .where(WordTag.language_id == language_id, WordTag.user_id == user.user_id)
        .order_by(WordTag.name)
    )
    return result.scalars().all()


@router.post("/{language_id}/tags/", response_model=TagRead, status_code=201)
async def create_tag(language_id: int, data: TagCreate, user: ModulesUsers = Depends(get_languages),
                     session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    tag = WordTag(name=normalize_tag_name(data.name), user_id=user.user_id, language_id=language_id)
    session.add(tag)
    await commit_or_conflict(session, f"Тег «{tag.name}» уже есть в этом языке")
    return tag


@router.delete("/{language_id}/tags/{tag_id}/", status_code=204)
async def delete_tag(language_id: int, tag_id: int,
                     user: ModulesUsers = Depends(get_languages),
                     session: AsyncSession = Depends(get_session)):
    tag = await get_user_tag(language_id, tag_id, user.user_id, session)
    await session.delete(tag)  # связи со словами удалит ON DELETE CASCADE
    await session.commit()
    return None


@router.patch("/{language_id}/tags/{tag_id}/", response_model=TagRead, status_code=200)
async def change_tag(language_id: int, tag_id: int,
                     data: TagChange, user: ModulesUsers = Depends(get_languages),
                     session: AsyncSession = Depends(get_session)):
    tag = await get_user_tag(language_id, tag_id, user.user_id, session)

    updated_data = data.model_dump(exclude_unset=True)
    if "name" in updated_data:
        updated_data["name"] = normalize_tag_name(updated_data["name"])

    for field, value in updated_data.items():
        setattr(tag, field, value)

    await commit_or_conflict(session, f"Тег «{tag.name}» уже есть в этом языке")
    await session.refresh(tag)
    return tag


@router.get("/{language_id}/tags/{tag_id}/", response_model=TagRead)
async def get_tag(language_id: int, tag_id: int,
                  user: ModulesUsers = Depends(get_languages),
                  session: AsyncSession = Depends(get_session)):
    return await get_user_tag(language_id, tag_id, user.user_id, session)
