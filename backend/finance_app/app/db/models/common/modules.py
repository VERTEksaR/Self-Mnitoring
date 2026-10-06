from typing import List, TYPE_CHECKING

from sqlalchemy import String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.finance_app.app.db.base import Base

if TYPE_CHECKING:
    from backend.finance_app.app.db.models.common.user import User


class Modules(Base):
    __tablename__ = "modules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False, unique=True)

    modules_users: Mapped[List["ModulesUsers"]] = relationship("ModulesUsers", back_populates="module")

    def __str__(self):
        return self.name


class ModulesUsers(Base):
    __tablename__ = "modules_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="modules_users")
    module_id: Mapped[int] = mapped_column(ForeignKey("modules.id"), nullable=False)
    module: Mapped["Modules"] = relationship("Modules", back_populates="modules_users")

    __table_args__ = (UniqueConstraint("user_id", "module_id"),)
