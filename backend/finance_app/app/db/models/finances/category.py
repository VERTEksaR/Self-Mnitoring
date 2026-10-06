from typing import List, TYPE_CHECKING

from sqlalchemy import String, Integer, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.finance_app.app.db.base import Base

if TYPE_CHECKING:
    from backend.finance_app.app.db.models.common.user import User
    from backend.finance_app.app.db.models.finances.transaction import Transaction


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True, nullable=False)

    show_analytics: Mapped[bool] = mapped_column(Boolean, default=True)

    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="category")

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="categories")

    __table_args__ = (UniqueConstraint("name", "user_id"),)

    def __str__(self):
        return self.name
