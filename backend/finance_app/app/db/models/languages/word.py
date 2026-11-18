import enum
from datetime import date, datetime
from typing import Optional, TYPE_CHECKING, List

from sqlalchemy import String, Integer, DateTime, ForeignKey, UniqueConstraint, Enum, func, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.finance_app.app.db.base import Base

if TYPE_CHECKING:
    from backend.finance_app.app.db.models.languages.language import Language
    from backend.finance_app.app.db.models.common.user import User


class PartOfSpeech(str, enum.Enum):
    NOUN = "Существительное"
    VERB = "Глагол"
    ADJECTIVE = "Прилагательное"
    ADVERB = "Наречие"
    PRONOUN = "Местоимение"
    NUMERAL = "Числительное"
    PREPOSITION = "Предлог"
    CONJUNCTION = "Союз"
    INTERJECTION = "Междометие"
    PHRASE = "Фраза"

    def __str__(self):
        return self.value


class Word(Base):
    __tablename__ = "words"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    word: Mapped[str] = mapped_column(String, index=True, nullable=False)
    translation: Mapped[str] = mapped_column(String, nullable=False)
    transcription: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    part_of_speech: Mapped[Optional[PartOfSpeech]] = mapped_column(Enum(
        PartOfSpeech,
        values_callable=lambda c: [e.value for e in c],
        native_enum=False
    ), nullable=True)
    example: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    note: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    language_id: Mapped[int] = mapped_column(ForeignKey('languages.id'), nullable=False)
    language: Mapped["Language"] = relationship("Language", back_populates="words")
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="words")
    box: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    next_review_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    tags: Mapped[List["WordTag"]] = relationship("WordTag", secondary="word_tag_links",
                                                 lazy="selectin", order_by="WordTag.name")

    __table_args__ = (UniqueConstraint("word", "language_id", "user_id"),)

    def __str__(self):
        return self.word


class WordTagLinks(Base):
    __tablename__ = "word_tag_links"

    word_id: Mapped[int] = mapped_column(ForeignKey('words.id', ondelete='CASCADE'), primary_key=True)
    tag_id: Mapped[int] = mapped_column(ForeignKey('word_tags.id', ondelete='CASCADE'), primary_key=True)


class WordTag(Base):
    __tablename__ = "word_tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    language_id: Mapped[int] = mapped_column(ForeignKey('languages.id'), nullable=False)
    language: Mapped["Language"] = relationship("Language", back_populates="tags")
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="word_tags")

    __table_args__ = (UniqueConstraint("name", "language_id", "user_id"),)

    def __str__(self):
        return self.name
