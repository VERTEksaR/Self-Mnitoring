import enum
from decimal import Decimal
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Integer, ForeignKey, UniqueConstraint, Numeric, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.finance_app.app.db.base import Base

if TYPE_CHECKING:
    from backend.finance_app.app.db.models.common.user import User


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
