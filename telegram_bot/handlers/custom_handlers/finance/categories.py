import requests

from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import Message

from telegram_bot.loader import my_router
from telegram_bot.config_data.config import APP_API


@my_router.message(Command(commands=['categories']))
async def categories_command(message: Message, state: FSMContext):
    try:
        headers = {'Authorization': 'Bearer ' + ''}
        response = requests.get(APP_API + '/categories', headers=headers)
        print(1, response)
        await message.answer(response.text)
    except Exception as e:
        await message.answer(str(e))
