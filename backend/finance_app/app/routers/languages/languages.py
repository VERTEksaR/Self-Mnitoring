import logging
from math import ceil

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from backend.finance_app.app.db.models.languages.word import WordTag
from backend.finance_app.app.dependencies.auth import get_languages
from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.db.models import ModulesUsers, LanguageNote, Language, Word
from backend.finance_app.app.schemas.common.common import PageNumber, PageSize, Page
from backend.finance_app.app.schemas.languages.language import LanguageRead, LanguageChange, LanguageCreate
from backend.finance_app.app.schemas.languages.word import WordRead, WordChange, WordCreate
from backend.finance_app.app.schemas.languages.note import LanguageNoteRead, LanguageNoteChange, LanguageNoteCreate
from backend.finance_app.app.utils.check_availability import check_availability
from backend.finance_app.app.utils.commit import commit_or_conflict
from backend.finance_app.app.utils.language_tags import get_language_tags

router = APIRouter()

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s - %(name)s - %(asctime)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@router.get("/", response_model=list[LanguageRead])
async def get_all_languages(user: ModulesUsers = Depends(get_languages), session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(Language)
        .where(Language.user_id == user.user_id)
    )
    languages = result.scalars().all()
    return languages


@router.post("/", response_model=LanguageRead, status_code=201)
async def create_language(data: LanguageCreate, user: ModulesUsers = Depends(get_languages),
                          session: AsyncSession = Depends(get_session)):
    language = Language(**data.model_dump(), user_id=user.user_id)
    session.add(language)
    await commit_or_conflict(session, f"Язык «{data.name}» уже существует")
    logger.info(f"Язык с id {language.id} был создан")
    return language


@router.delete("/{language_id}/", status_code=204)
async def delete_language(language_id: int, user: ModulesUsers = Depends(get_languages),
                          session: AsyncSession = Depends(get_session)):
    language = await check_availability(language_id, user.user_id, Language, session)
    await session.delete(language)
    await session.commit()
    logger.info(f"Язык с id {language_id} был удален")
    return None


@router.patch("/{language_id}/", response_model=LanguageRead, status_code=200)
async def change_language(language_id: int, data: LanguageChange, user: ModulesUsers = Depends(get_languages),
                          session: AsyncSession = Depends(get_session)):
    language = await check_availability(language_id, user.user_id, Language, session)
    updated_data = data.model_dump(exclude_unset=True)

    for field, value in updated_data.items():
        setattr(language, field, value)

    await commit_or_conflict(session, f"Язык «{language.name}» уже существует")
    await session.refresh(language)
    return language


@router.get("/{language_id}/", response_model=LanguageRead, status_code=200)
async def get_language(language_id: int, user: ModulesUsers = Depends(get_languages),
                       session: AsyncSession = Depends(get_session)):
    language = await check_availability(language_id, user.user_id, Language, session)
    return language


@router.get("/{language_id}/words/", response_model=Page[WordRead], status_code=200)
async def get_language_words(language_id: int, tag_id: int | None = None, search: str = '',
                             page: PageNumber = 1, size: PageSize = 10, user: ModulesUsers = Depends(get_languages),
                             session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    conditions = [Word.language_id == language_id, Word.user_id == user.user_id,
                  or_(Word.word.ilike(f'%{search}%'), Word.translation.ilike(f'%{search}%'))]

    if tag_id is not None:
        conditions.append(Word.tags.any(WordTag.id == tag_id))

    total_result = await session.execute(
        select(func.count())
        .where(*conditions)
    )
    total = total_result.scalar_one()

    result = await session.execute(
        select(Word)
        .where(*conditions)
        .offset((page - 1) * size).limit(size)
        .order_by(Word.id.desc())
    )
    words = result.scalars().all()
    pages = ceil(total / size) if total > 0 else 1
    logger.info(f"Всего было найдено {total} слов")

    result = {
        'items': [WordRead.model_validate(w).model_dump(mode="json") for w in words],
        'total': total,
        'pages': pages,
        'page': page,
        'size': size,
    }

    return result


@router.post("/{language_id}/words/", response_model=WordRead, status_code=201)
async def create_language_word(language_id: int, data: WordCreate, user: ModulesUsers = Depends(get_languages),
                               session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    word = Word(**data.model_dump(exclude={"tag_ids"}), user_id=user.user_id, language_id=language_id)
    word.tags = await get_language_tags(data.tag_ids, language_id, user.user_id, session)
    session.add(word)
    await commit_or_conflict(session, f"Слово «{data.word}» уже есть в этом языке")
    return word


@router.delete("/{language_id}/words/{word_id}/", status_code=204)
async def delete_language_word(language_id: int, word_id: int,
                               user: ModulesUsers = Depends(get_languages),
                               session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    result = await session.execute(
        select(Word)
        .where(Word.language_id == language_id, Word.user_id == user.user_id,
               Word.id == word_id)
    )
    word = result.scalar_one_or_none()

    if word is None:
        logger.error(f"Слово с id {word_id} не было найдено")
        raise HTTPException(status_code=404, detail=f"Слово с id {word_id} не было найдено")

    await session.delete(word)
    await session.commit()
    return None


@router.patch("/{language_id}/words/{word_id}/", response_model=WordRead, status_code=200)
async def change_language_word(language_id: int, word_id: int,
                               data: WordChange, user: ModulesUsers = Depends(get_languages),
                               session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    result = await session.execute(
        select(Word)
        .where(Word.language_id == language_id, Word.user_id == user.user_id,
               Word.id == word_id)
    )
    word = result.scalar_one_or_none()

    if word is None:
        logger.error(f"Слово с id {word_id} не было найдено")
        raise HTTPException(status_code=404, detail=f"Слово с id {word_id} не было найдено")

    updated_data = data.model_dump(exclude_unset=True)
    tag_ids = updated_data.pop("tag_ids", None)

    for field, value in updated_data.items():
        setattr(word, field, value)

    if tag_ids is not None:
        word.tags = await get_language_tags(tag_ids, language_id, user.user_id, session)

    await commit_or_conflict(session, f"Слово «{word.word}» уже есть в этом языке")
    await session.refresh(word)
    return word


@router.get("/{language_id}/words/{word_id}/", response_model=WordRead, status_code=200)
async def get_language_word(language_id: int, word_id: int,
                            user: ModulesUsers = Depends(get_languages),
                            session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    result = await session.execute(
        select(Word)
        .where(Word.language_id == language_id, Word.user_id == user.user_id,
               Word.id == word_id)
    )
    word = result.scalar_one_or_none()

    if word is None:
        logger.error(f"Слово с id {word_id} не было найдено")
        raise HTTPException(status_code=404, detail=f"Слово с id {word_id} не было найдено")

    return word


@router.get("/{language_id}/notes/", response_model=Page[LanguageNoteRead], status_code=200)
async def get_language_notes(language_id: int, page: PageNumber = 1, size: PageSize = 10,
                             user: ModulesUsers = Depends(get_languages),
                             session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    total_result = await session.execute(
        select(func.count())
        .where(LanguageNote.language_id == language_id, LanguageNote.user_id == user.user_id)
    )
    total = total_result.scalar_one()

    result = await session.execute(
        select(LanguageNote)
        .where(LanguageNote.language_id == language_id, LanguageNote.user_id == user.user_id)
        .offset((page - 1) * size).limit(size)
        .order_by(LanguageNote.id.desc())
    )
    notes = result.scalars().all()
    pages = ceil(total / size) if total > 0 else 1
    logger.info(f"Всего было найдено {total} конспектов")

    result = {
        'items': [LanguageNoteRead.model_validate(n).model_dump(mode="json") for n in notes],
        'total': total,
        'pages': pages,
        'page': page,
        'size': size,
    }

    return result


@router.post("/{language_id}/notes/", response_model=LanguageNoteRead, status_code=201)
async def create_language_note(language_id: int, data: LanguageNoteCreate, user: ModulesUsers = Depends(get_languages),
                               session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    note = LanguageNote(**data.model_dump(), user_id=user.user_id, language_id=language_id)
    session.add(note)
    await session.commit()
    return note


@router.delete("/{language_id}/notes/{note_id}/", status_code=204)
async def delete_language_note(language_id: int, note_id: int,
                               user: ModulesUsers = Depends(get_languages),
                               session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    result = await session.execute(
        select(LanguageNote)
        .where(LanguageNote.language_id == language_id, LanguageNote.user_id == user.user_id,
               LanguageNote.id == note_id)
    )
    note = result.scalar_one_or_none()

    if note is None:
        logger.error(f"Конспект с id {note_id} не был найден")
        raise HTTPException(status_code=404, detail=f"Конспект с id {note_id} не был найден")

    await session.delete(note)
    await session.commit()
    return None


@router.patch("/{language_id}/notes/{note_id}/", response_model=LanguageNoteRead, status_code=200)
async def change_language_note(language_id: int, note_id: int,
                               data: LanguageNoteChange,
                               user: ModulesUsers = Depends(get_languages),
                               session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    result = await session.execute(
        select(LanguageNote)
        .where(LanguageNote.language_id == language_id, LanguageNote.user_id == user.user_id,
               LanguageNote.id == note_id)
    )
    note = result.scalar_one_or_none()

    if note is None:
        logger.error(f"Конспект с id {note_id} не был найден")
        raise HTTPException(status_code=404, detail=f"Конспект с id {note_id} не был найден")

    updated_data = data.model_dump(exclude_unset=True)

    for field, value in updated_data.items():
        setattr(note, field, value)

    await session.commit()
    await session.refresh(note)
    return note


@router.get('/{language_id}/notes/{note_id}/', response_model=LanguageNoteRead, status_code=200)
async def get_language_note(language_id: int, note_id: int,
                            user: ModulesUsers = Depends(get_languages),
                            session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    result = await session.execute(
        select(LanguageNote)
        .where(LanguageNote.language_id == language_id, LanguageNote.user_id == user.user_id,
               LanguageNote.id == note_id)
    )
    note = result.scalar_one_or_none()

    if note is None:
        logger.error(f"Конспект с id {note_id} не был найден")
        raise HTTPException(status_code=404, detail=f"Конспект с id {note_id} не был найден")

    return note
