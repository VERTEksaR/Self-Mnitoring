# import aiohttp
#
# from telegram_bot.config_data.config import APP_API
# from aiogram.filters import Command, StateFilter
# from aiogram.fsm.context import FSMContext
# from aiogram.types import Message
#
# from telegram_bot.loader import my_router
# from telegram_bot.states.data import Auth
#
#
# async def test_connection_to_app():
#     async with aiohttp.ClientSession() as session:
#         async with session.get(
#             APP_API + '/telegram/test',
#             headers={"Authorization": "Bearer" + ""}
#         ) as response:

