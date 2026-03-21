import aiohttp

from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import Message

from telegram_bot.keyboards.inline import categories
from telegram_bot.loader import my_router, bot
from telegram_bot.config_data.config import APP_API
from telegram_bot.states.data import Category
from telegram_bot.utils.misc.first_connect import first_connect


@my_router.message(Category.name)
async def process_category(message: Message, state: FSMContext):
    data = await state.get_data()

    category_msg_id = data['category_msg_id']
    await message.delete()
    await bot.delete_message(message.chat.id, category_msg_id)

    category_data = {'name': message.text, 'user_id': message.from_user.id}

    async with aiohttp.ClientSession() as session:
        token = await first_connect(message.from_user.id)

        async with session.post(
            APP_API + '/categories',
            headers={'Authorization': f'Bearer {token}'},
            json=category_data
        ) as response:
            data = await response.json()
            print(data)
            await message.answer(text=f'Категория {category_data["name"]} создана')
            async with session.get(
                    APP_API + '/categories',
                    headers={'Authorization': f'Bearer {token}'}
            ) as response_all:
                new_data = await response_all.json()
                print(new_data)
                await state.clear()
                await categories.categories(message, new_data, is_created=True)
        await state.clear()
