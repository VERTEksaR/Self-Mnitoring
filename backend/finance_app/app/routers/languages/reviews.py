from datetime import date
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.finance_app.app.dependencies.auth import get_languages
from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.db.models import ModulesUsers, Language, Word, WordReview, WordTag
from backend.finance_app.app.schemas.languages.review import ReviewBatch, ReviewAnswer, ChoiceItem
from backend.finance_app.app.schemas.languages.word import WordRead
from backend.finance_app.app.utils.check_availability import check_availability
from backend.finance_app.app.utils.next_review import next_review
from backend.finance_app.app.utils.stats import due_conditions

router = APIRouter()


@router.get("/{language_id}/review/", response_model=ReviewBatch)
async def get_review(language_id: int, limit: int = Query(20, ge=1, le=100),
                     tag_id: Optional[int] = None,
                     user: ModulesUsers = Depends(get_languages), session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    due = due_conditions(language_id, user.user_id, date.today())

    if tag_id is not None:
        due.append(Word.tags.any(WordTag.id == tag_id))

    result = await session.execute(
        select(func.count())
        .where(*due)
    )
    total = result.scalar_one()

    # Сначала давно просроченные, новые (NULL) — в конце: повторение важнее новых слов
    result = await session.execute(
        select(Word)
        .where(*due)
        .order_by(Word.next_review_date.asc().nulls_last(), Word.id)
        .limit(limit)
    )
    return {"items": result.scalars().all(), "total": total}


@router.post("/{language_id}/words/{word_id}/review/", response_model=WordRead)
async def answer_review(language_id: int, word_id: int, data: ReviewAnswer,
                        user: ModulesUsers = Depends(get_languages),
                        session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)
    word = await check_availability(word_id, user.user_id, Word, session)

    if word.language_id != language_id:
        raise HTTPException(status_code=404, detail=f"Слово с id {word_id} не найдено")

    today = date.today()

    # Двойной клик или две вкладки не должны поднять слово сразу на две коробки
    if word.next_review_date is not None and word.next_review_date > today:
        raise HTTPException(status_code=409, detail="Это слово ещё не пора повторять")

    word.box, word.next_review_date = next_review(word.box, data.remembered, today)
    session.add(WordReview(word_id=word.id, language_id=language_id, user_id=user.user_id,
                           remembered=data.remembered, box=word.box))

    await session.commit()
    await session.refresh(word)
    return word


@router.get("/{language_id}/review/choices/", response_model=ChoiceItem, status_code=200)
async def get_choices(language_id: int, limit: int = Query(40, ge=4, le=100),
                      user: ModulesUsers = Depends(get_languages),
                      session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)

    result = await session.execute(
        select(Word.id, Word.word, Word.translation)
        .where(Word.language_id == language_id, Word.user_id == user.user_id)
        .order_by(func.random())
        .limit(limit)
    )
    return result.mappings().all()
