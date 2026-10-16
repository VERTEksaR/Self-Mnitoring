import enum
from datetime import date, datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import Integer, Text, Date, DateTime, ForeignKey, Enum, CheckConstraint, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.finance_app.app.db.base import Base

if TYPE_CHECKING:
    from backend.finance_app.app.db.models.languages.language import Language
    from backend.finance_app.app.db.models.common.user import User


class StudyType(str, enum.Enum):
    WORDS = "Слова"
    GRAMMAR = "Грамматика"
    READING = "Чтение"
    LISTENING = "Аудирование"
    SPEAKING = "Говорение"
    WRITING = "Письмо"

    def __str__(self):
        return self.value


class StudySession(Base):
    __tablename__ = "study_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    study_date: Mapped[date] = mapped_column(Date, nullable=False)
    minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    study_type: Mapped[StudyType] = mapped_column(
        Enum(
            StudyType,
            values_callable=lambda c: [e.value for e in c],
            native_enum=False,
        ), nullable=False
    )
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    language_id: Mapped[int] = mapped_column(ForeignKey('languages.id'), nullable=False)
    language: Mapped["Language"] = relationship("Language", back_populates="study_sessions")
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="study_sessions")

    __table_args__ = (
        CheckConstraint("minutes > 0", name="study_sessions_minutes_positive"),
        Index("ix_study_sessions_language_date", "language_id", "study_date"),
    )
