from typing import List, TYPE_CHECKING

from sqlalchemy import String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.finance_app.app.db.base import Base

if TYPE_CHECKING:
    from backend.finance_app.app.db.models.common.modules import ModulesUsers
    from backend.finance_app.app.db.models.finances.account import Account
    from backend.finance_app.app.db.models.finances.category import Category
    from backend.finance_app.app.db.models.finances.transaction import Transaction
    from backend.finance_app.app.db.models.steam.steam import SteamUser
    from backend.finance_app.app.db.models.trainings.exercises import Exercises, TrainingExercises
    from backend.finance_app.app.db.models.trainings.trainings import Trainings


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
    steam_users: Mapped[List["SteamUser"]] = relationship("SteamUser", back_populates="user")
    exercises: Mapped[List["Exercises"]] = relationship("Exercises", back_populates="user")
    trainings: Mapped[List["Trainings"]] = relationship("Trainings", back_populates="user")
    exercise_trainings: Mapped[List["TrainingExercises"]] = relationship("TrainingExercises", back_populates="user")
    modules_users: Mapped[List["ModulesUsers"]] = relationship("ModulesUsers", back_populates="user")

    def __str__(self):
        return self.email


class TelegramUser(Base):
    __tablename__ = "telegram_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    telegram_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    access_token: Mapped[str] = mapped_column(String, nullable=False)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="telegram_users")
