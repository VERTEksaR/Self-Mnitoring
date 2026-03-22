import aiohttp

from aiogram.fsm.context import FSMContext
from aiogram.types import Message

from telegram_bot.keyboards.inline import login_logon
from telegram_bot.keyboards.inline.buttons_categories import categories, create_category
from telegram_bot.loader import my_router, bot
from telegram_bot.config_data.config import APP_API
from telegram_bot.states.data import Category
from telegram_bot.utils.misc.first_connect import first_connect


@my_router.message(Category.category_name)
async def process_category(message: Message, state: FSMContext):
    data = await state.get_data()

    category_msg_id = data['category_msg_id']
    category_msg_change = data['category_msg_change']
    await message.delete()
    await bot.delete_message(message.chat.id, category_msg_id)


    await bot.edit_message_text(
        chat_id=message.chat.id,
        message_id=category_msg_change,
        text='Создание категории:\n\n'
             f'Название: [{message.text}]\n',
        reply_markup=create_category.create_inline_category
    )


