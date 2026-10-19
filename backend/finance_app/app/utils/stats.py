from datetime import timedelta, date

from sqlalchemy import or_

from backend.finance_app.app.db.models.languages.word import Word


def week_start(d: date) -> date:
    return d - timedelta(days=d.weekday())


def calc_streak(days: set[date], today: date) -> int:
    day = today if today in days else today - timedelta(days=1)
    streak = 0

    while day in days:
        streak += 1
        day -= timedelta(days=1)

    return streak


def due_conditions(language_id: int, user_id: int, today: date) -> list:
    return [Word.language_id == language_id, Word.user_id == user_id,
            or_(Word.next_review_date.is_(None), Word.next_review_date <= today)]
