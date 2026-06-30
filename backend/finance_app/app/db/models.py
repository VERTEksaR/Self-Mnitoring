import enum
from datetime import date
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import String, Integer, Boolean, Float, DATE, ForeignKey, UniqueConstraint, Numeric, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.finance_app.app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nickname: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    categories: Mapped[List["Category"]] = relationship("Category", back_populates="user")
    accounts: Mapped[List["Account"]] = relationship("Account", back_populates="user")
    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="user")
    telegram_users: Mapped[List["TelegramUser"]] = relationship("TelegramUser", back_populates="user")
    exercises: Mapped[List["Exercises"]] = relationship("Exercises", back_populates="user")
    trainings: Mapped[List["Trainings"]] = relationship("Trainings", back_populates="user")
    exercise_trainings: Mapped[List["TrainingExercises"]] = relationship("TrainingExercises", back_populates="user")

    def __str__(self):
        return self.email


class TelegramUser(Base):
    __tablename__ = "telegram_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    telegram_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    access_token: Mapped[str] = mapped_column(String, nullable=False)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="telegram_users")


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


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True, nullable=False)

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


class MuscleGroup(str, enum.Enum):
    LEGS = "Ноги"
    CHEST = "Грудь"
    BICEPS = "Бицепс"
    TRICEPS = "Трицепс"
    BACK = "Спина"
    SHOULDERS = "Плечи"
    ABS = "Пресс"

    def __str__(self):
        return self.value


class ExerciseType(str, enum.Enum):
    CARDIO = "Кардио"
    STRENGTH = "Силовое"
    STRETCHING = "Растяжка"

    def __str__(self):
        return self.value


class Exercises(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True, nullable=False)
    muscle_group: Mapped[MuscleGroup] = mapped_column(
        Enum(
            MuscleGroup,
            values_callable=lambda c: [e.value for e in c],
            native_enum=False
        ), nullable=False
    )
    exercise_type: Mapped[ExerciseType] = mapped_column(
        Enum(
            ExerciseType,
            values_callable=lambda c: [e.value for e in c],
            native_enum=False
        ), nullable=False
    )

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="exercises")

    __table_args__ = (UniqueConstraint("name", "user_id"),)

    def __str__(self):
        return self.name


class TrainingExercises(Base):
    __tablename__ = "training_exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    training_id: Mapped[int] = mapped_column(ForeignKey("trainings.id"), nullable=False)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id"), nullable=False)
    quantity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    weight: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="exercise_trainings")
    exercise: Mapped["Exercises"] = relationship("Exercises", lazy="selectin")

    __table_args__ = (UniqueConstraint("training_id", "exercise_id", "user_id"),)


class Trainings(Base):
    __tablename__ = "trainings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True, nullable=False)
    date: Mapped[date] = mapped_column(DATE, nullable=False)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="trainings")
    training_exercises: Mapped[List["TrainingExercises"]] = relationship(
        "TrainingExercises", lazy="selectin", cascade="all, delete-orphan"
    )

    __table_args__ = (UniqueConstraint("name", "user_id"),)

    def __str__(self):
        return self.name
