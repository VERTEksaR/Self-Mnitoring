from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession
from backend.finance_app.app.db.models import ModulesUsers, Language, Word, WordReview, StudySession
from backend.finance_app.app.dependencies.auth import get_languages
from backend.finance_app.app.utils.check_availability import check_availability
from backend.finance_app.app.utils.next_review import MAX_BOX
from backend.finance_app.app.utils.stats import week_start, calc_streak, due_conditions
from backend.finance_app.app.schemas.languages.stats import LanguageStats
from backend.finance_app.app.db.session import get_session

router = APIRouter()


@router.get("/{language_id}/stats/", response_model=LanguageStats, status_code=200)
async def get_language_stats(language_id: int, weeks: int = Query(12, ge=1, le=52),
                             user: ModulesUsers = Depends(get_languages),
                             session: AsyncSession = Depends(get_session)):
    await check_availability(language_id, user.user_id, Language, session)

    today = date.today()
    start = week_start(today) - timedelta(weeks=weeks - 1)
    start_dt = datetime.combine(start, time.min)

    own_words = [Word.language_id == language_id, Word.user_id == user.user_id]
    own_reviews = [WordReview.language_id == language_id, WordReview.user_id == user.user_id]
    own_sessions = [StudySession.language_id == language_id, StudySession.user_id == user.user_id]

    result = await session.execute(
        select(func.count(), func.coalesce(
            func.sum(case(
                (Word.box >= MAX_BOX, 1),
                else_=0
            )), 0
        ))
        .where(*own_words)
    )
    total_words, learned_words = result.one()

    result = await session.execute(
        select(func.count())
        .where(*due_conditions(language_id, user.user_id, today))
    )
    due_today = result.scalar_one()

    buckets = {}

    for week_id in range(weeks):
        week = start + timedelta(weeks=week_id)
        buckets[week] = {"week": week, "words_added": 0, "words_learned": 0, "reviews": 0, "remembered": 0, "minutes": 0}

    def add(day: date, field: str, value: int = 1):
        bucket = buckets.get(week_start(day))

        if bucket:
            bucket[field] += value

    result = await session.execute(
        select(Word.created_at)
        .where(*own_words, Word.created_at >= start_dt)
    )

    for created_at in result.scalars():
        add(created_at.date(), "words_added")

    first_learned = (
        select(func.min(WordReview.reviewed_at).label("at"))
        .where(*own_reviews, WordReview.box == MAX_BOX, WordReview.word_id.is_not(None))
        .group_by(WordReview.word_id)
        .subquery()
    )
    result = await session.execute(
        select(first_learned.c.at)
        .where(first_learned.c.at >= start_dt)
    )

    for at in result.scalars():
        add(at.date(), "words_learned")

    result = await session.execute(
        select(WordReview.reviewed_at, WordReview.remembered)
        .where(*own_reviews, WordReview.reviewed_at >= start_dt)
    )

    for reviewed_at, remembered in result.all():
        add(reviewed_at.date(), "reviews")

        if remembered:
            add(reviewed_at.date(), "remembered")

    result = await session.execute(
        select(StudySession.study_date, StudySession.minutes)
        .where(*own_sessions, StudySession.study_date >= start)
    )

    for study_date, minutes in result.all():
        add(study_date, "minutes", minutes)

    total = func.sum(StudySession.minutes)
    result = await session.execute(
        select(StudySession.study_type, total)
        .where(*own_sessions, StudySession.study_date >= start)
        .group_by(StudySession.study_type)
        .order_by(total.desc())
    )
    minutes_by_type = [{"study_type": t, "minutes": m} for t, m in result.all()]

    year_ago = today - timedelta(days=365)
    result = await session.execute(
        select(WordReview.reviewed_at)
        .where(*own_reviews, WordReview.reviewed_at >= datetime.combine(year_ago, time.min))
    )
    days = {reviewed_at.date() for reviewed_at in result.scalars()}
    result = await session.execute(
        select(StudySession.study_date)
        .where(*own_sessions, StudySession.study_date >= year_ago)
    )
    days |= set(result.scalars())

    week_list = list(buckets.values())
    period_reviews = sum(w["reviews"] for w in week_list)
    period_remembered = sum(w["remembered"] for w in week_list)

    return {
        "total_words": total_words,
        "learned_words": learned_words,
        "due_today": due_today,
        "streak_days": calc_streak(days, today),
        "period_reviews": period_reviews,
        "period_accuracy": round(period_remembered * 100 / period_reviews) if period_reviews else None,
        "period_minutes": sum(w["minutes"] for w in week_list),
        "weeks": week_list,
        "minutes_by_type": minutes_by_type,
    }