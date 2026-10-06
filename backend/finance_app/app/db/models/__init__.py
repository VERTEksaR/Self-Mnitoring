# Все модели импортируются здесь: Alembic видит таблицу, а строковые relationship("...")
# находят класс, только если его модуль загружен. Новую модель обязательно добавить сюда.
from backend.finance_app.app.db.models.common.user import User, TelegramUser
from backend.finance_app.app.db.models.common.modules import Modules, ModulesUsers
from backend.finance_app.app.db.models.finances.category import Category
from backend.finance_app.app.db.models.finances.account import AccountType, Account
from backend.finance_app.app.db.models.finances.transaction import Transaction
from backend.finance_app.app.db.models.trainings.exercises import MuscleGroup, ExerciseType, Exercises, TrainingExercises
from backend.finance_app.app.db.models.trainings.trainings import Trainings
from backend.finance_app.app.db.models.steam.steam import SteamUser, SteamTrackedGamse

__all__ = [
    "User", "TelegramUser", "Modules", "ModulesUsers",
    "Category", "AccountType", "Account", "Transaction",
    "MuscleGroup", "ExerciseType", "Exercises", "TrainingExercises", "Trainings",
    "SteamUser", "SteamTrackedGamse",
]
