import enum
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import String, Integer, ForeignKey, UniqueConstraint, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.finance_app.app.db.base import Base

if TYPE_CHECKING:
    from backend.finance_app.app.db.models.common.user import User
    from backend.finance_app.app.db.models.languages.note import LanguageNote
    from backend.finance_app.app.db.models.languages.word import Word, WordTag


class LanguageLevels(str, enum.Enum):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"

    def __str__(self):
        return self.value


class Language(Base):
    __tablename__ = "languages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    current_level: Mapped[LanguageLevels] = mapped_column(Enum(
        LanguageLevels,
        values_callable=lambda c: [e.value for e in c],
        native_enum=False
    ), nullable=False)
    target_level: Mapped[LanguageLevels] = mapped_column(Enum(
        LanguageLevels,
        values_callable=lambda c: [e.value for e in c],
        native_enum=False
    ), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="languages")
    words: Mapped[List["Word"]] = relationship("Word", cascade="all, delete-orphan", back_populates="language")
    notes: Mapped[List["LanguageNote"]] = relationship("LanguageNote", cascade="all, delete-orphan", back_populates="language")
    tags: Mapped[List["WordTag"]] = relationship("WordTag", back_populates="language", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint("name", "user_id"),)

    def __str__(self):
        return self.name

