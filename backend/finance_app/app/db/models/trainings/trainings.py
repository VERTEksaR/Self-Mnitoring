from datetime import date
from typing import List, TYPE_CHECKING

from sqlalchemy import String, Integer, DATE, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.finance_app.app.db.base import Base

if TYPE_CHECKING:
    from backend.finance_app.app.db.models.common.user import User
    from backend.finance_app.app.db.models.trainings.exercises import TrainingExercises


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
