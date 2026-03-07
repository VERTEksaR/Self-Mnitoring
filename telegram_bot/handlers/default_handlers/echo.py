from aiogram.filters import StateFilter
from aiogram.types import Message

from telegram_bot.loader import my_router


@my_router.message(StateFilter(None))
async def bot_echo(message: Message):
    await message.reply(message.text)