from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, Boolean, DATE, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.finance_app.app.db.base import Base

if TYPE_CHECKING:
    from backend.finance_app.app.db.models.common.user import User
    from backend.finance_app.app.db.models.finances.account import Account
    from backend.finance_app.app.db.models.finances.category import Category


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    destination: Mapped[str] = mapped_column(String, nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    cashback: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    replenishment: Mapped[bool] = mapped_column(Boolean, default=False)
    transaction_date: Mapped[date] = mapped_column(DATE, nullable=True)

    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False)
    category: Mapped["Category"] = relationship("Category", back_populates="transactions")

    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False)
    account: Mapped["Account"] = relationship("Account", back_populates="transactions")

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="transactions")

    def __str__(self):
        return f"{self.amount} {self.replenishment} {self.transaction_date}"
