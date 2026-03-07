from aiogram.types import BotCommand

from telegram_bot.config_data.config import DEFAULT_COMMANDS
from telegram_bot.loader import bot


async def set_default_commands():
    result = await bot.set_my_commands(
        [BotCommand(command=i[0], description=i[1]) for i in DEFAULT_COMMANDS]
    )
    return result