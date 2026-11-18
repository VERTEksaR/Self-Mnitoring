from datetime import datetime
from typing import Optional

from sqlalchemy import Integer, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from backend.finance_app.app.db.base import Base


class WordReview(Base):
    """Журнал ответов «помню / не помню» — из него считается статистика (этап 7)."""
    __tablename__ = "word_reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    # Слово удалили — ответ остаётся в истории; язык удалили — его журнал уходит вместе с ним
    word_id: Mapped[Optional[int]] = mapped_column(ForeignKey("words.id", ondelete="SET NULL"), nullable=True)
    language_id: Mapped[int] = mapped_column(ForeignKey("languages.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    remembered: Mapped[bool] = mapped_column(Boolean, nullable=False)
    box: Mapped[int] = mapped_column(Integer, nullable=False)  # коробка после ответа
    reviewed_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
