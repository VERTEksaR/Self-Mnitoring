from aiogram import Bot, Dispatcher, Router
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.client.session.aiohttp import AiohttpSession

from telegram_bot.config_data import config

my_router = Router(name=__name__)

session = AiohttpSession(proxy='http://proxy.server:3128') # в proxy указан прокси сервер pythonanywhere, он нужен для подключения

storage = MemoryStorage()
bot = Bot(token=config.BOT_TOKEN, session=session)
dp = Dispatcher(storage=storage)