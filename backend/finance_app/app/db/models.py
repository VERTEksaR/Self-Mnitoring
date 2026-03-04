from datetime import date
from typing import List

from sqlalchemy import String, Integer, Boolean, Float, DATE, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.finance_app.app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    categories: Mapped[List["Category"]] = relationship("Category", back_populates="user")
    accounts: Mapped[List["Account"]] = relationship("Account", back_populates="user")
    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="user")

    def __str__(self):
        return self.email


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)

    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="category")

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="categories")

    __table_args__ = (UniqueConstraint("name", "user_id"),)

    def __str__(self):
        return self.name


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)

    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="account")

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="accounts")

    __table_args__ = (UniqueConstraint("name", "user_id"),)

    def __str__(self):
        return self.name


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    destination: Mapped[str] = mapped_column(String, nullable=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    cashback: Mapped[float] = mapped_column(Float, nullable=False)
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