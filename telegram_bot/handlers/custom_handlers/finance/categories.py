# import aiohttp
#
# from aiogram.fsm.context import FSMContext
# from aiogram.types import Message
#
# from telegram_bot.keyboards.inline import login_logon
# from telegram_bot.keyboards.inline.buttons_categories import categories
# from telegram_bot.loader import my_router, bot
# from telegram_bot.config_data.config import APP_API
# from telegram_bot.states.data import Category
# from telegram_bot.utils.misc.first_connect import first_connect
#
#
# @my_router.message(Category.name)
# async def process_category(message: Message, state: FSMContext):
#     data = await state.get_data()
#
#     category_msg_id = data['category_msg_id']
#     await message.delete()
#     await bot.delete_message(message.chat.id, category_msg_id)
#
#     category_data = {'name': message.text, 'user_id': message.from_user.id}
#
#     async with aiohttp.ClientSession() as session:
#         token = await first_connect(message.from_user.id)
#
#         if token:
#             async with session.post(
#                 APP_API + '/categories',
#                 headers={'Authorization': f'Bearer {token}'},
#                 json=category_data
#             ) as response:
#                 if response.status != 400:
#                     await message.answer(text=f'Категория {category_data["name"]} создана')
#                     async with session.get(
#                             APP_API + '/categories',
#                             headers={'Authorization': f'Bearer {token}'}
#                     ) as response_all:
#                         data = await response_all.json()
#                         await state.clear()
#                         await categories.categories(message, data, is_created=True)
#                 else:
#                     await message.answer(text=f'Ошибка: категория с именем {category_data["name"]} уже существует')
#             await state.clear()
#         else:
#             await login_logon.login_logon(message, is_created=True)
