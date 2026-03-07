from aiogram.filters import Command
from aiogram.types import Message

from telegram_bot.loader import my_router
from telegram_bot.keyboards.inline import login_logon


@my_router.message(Command(commands=['start']))
async def start(message: Message):
    await login_logon.login_logon(message)
