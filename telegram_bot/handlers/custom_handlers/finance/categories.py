import aiohttp

from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import Message

from telegram_bot.loader import my_router, bot
from telegram_bot.config_data.config import APP_API
from telegram_bot.states.data import Category


@my_router.message(Category.name)
async def process_category(message: Message, state: FSMContext):
    data = await state.get_data()

    category_msg_id = data['category_msg_id']
    await message.delete()
    await bot.delete_message(message.chat.id, category_msg_id)

    category_data = {'name': message.text, 'user_id': message.from_user.id}

    async with aiohttp.ClientSession() as session:
        async with session.get(
            APP_API + '/telegram',
            params={"telegram_id": message.from_user.id, "app_id": 2}
        ) as response:
            data = await response.json()
            token = data.get('access_token', '')

        async with session.post(
            APP_API + '/categories',
            headers={'Authorization': f'Bearer {token}'},
            json=category_data
        ) as response:
            data = await response.json()
            print(data)
            await message.answer(text='Категория создана')
        await state.clear()
