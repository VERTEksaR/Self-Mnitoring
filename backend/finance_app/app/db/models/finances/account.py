import enum
from decimal import Decimal
from typing import List, TYPE_CHECKING

from sqlalchemy import String, Integer, ForeignKey, UniqueConstraint, Numeric, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.finance_app.app.db.base import Base

if TYPE_CHECKING:
    from backend.finance_app.app.db.models.common.user import User
    from backend.finance_app.app.db.models.finances.transaction import Transaction


class AccountType(str, enum.Enum):
    CHECKING = "Обычный"
    SAVINGS = "Накопительный"
    INVESTMENT = "Инвестиционный"

    def __str__(self):
        return self.value


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True, nullable=False)
    account_type: Mapped[AccountType] = mapped_column(
        Enum(
            AccountType,
            values_callable=lambda c: [e.value for e in c],
            native_enum=False
        ), nullable=False, server_default=AccountType.CHECKING
    )
    goal_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=True)

    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="account")

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="accounts")

    __table_args__ = (UniqueConstraint("name", "user_id"),)

    def __str__(self):
        return self.name
