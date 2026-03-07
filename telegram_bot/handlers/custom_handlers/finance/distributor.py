import requests

from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import Message

from telegram_bot.loader import my_router
from telegram_bot.config_data.config import APP_API
from telegram_bot.states.data import Choice


@my_router.message(StateFilter(Choice.finance))
async def check_city_name(message: Message, state: FSMContext):
    print(Choice.finance)
