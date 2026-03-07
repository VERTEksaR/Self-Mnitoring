import requests

from telegram_bot.config_data.config import APP_API
from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import Message

from telegram_bot.loader import my_router
from telegram_bot.states.data import Auth




