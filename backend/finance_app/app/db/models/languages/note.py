from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.finance_app.app.db.base import Base

if TYPE_CHECKING:
    from backend.finance_app.app.db.models.languages.language import Language
    from backend.finance_app.app.db.models.common.user import User


class LanguageNote(Base):
    __tablename__ = "language_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, onupdate=func.now())
    language_id: Mapped[int] = mapped_column(ForeignKey('languages.id'), nullable=False)
    language: Mapped["Language"] = relationship("Language", back_populates="notes")
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="language_notes")

