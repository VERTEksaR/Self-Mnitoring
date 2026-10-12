from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.finance_app.app.db.base import Base

if TYPE_CHECKING:
    from backend.finance_app.app.db.models.common.user import User


class SteamUser(Base):
    __tablename__ = "steam_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    steam_id: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="steam_users")


class SteamTrackedGamse(Base):
    __tablename__ = "steam_tracked_gamses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    steam_id: Mapped[str] = mapped_column(ForeignKey("steam_users.steam_id"), nullable=False)
    app_id: Mapped[int] = mapped_column(Integer, nullable=False)
    game_name: Mapped[str] = mapped_column(String, nullable=False)

    __table_args__ = (UniqueConstraint("steam_id", "app_id"),)
