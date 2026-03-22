import aiohttp
from aiogram import F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from telegram_bot.config_data.config import APP_API
from telegram_bot.keyboards.inline import login_logon, finance_choice
from telegram_bot.keyboards.inline.buttons_categories import category
from telegram_bot.loader import my_router, bot
from telegram_bot.utils.misc.first_connect import first_connect


def create_inline_category():
    category_button = InlineKeyboardBuilder()

    button_change_name = InlineKeyboardButton(text='Изменить название', callback_data='category_name_change')
    button_save = InlineKeyboardButton(text='Сохранить', callback_data='category_save')
    category_button.row(button_change_name)
    category_button.row(button_save)

    return category_button.as_markup()


async def create_category(chat: int, message: int, state: FSMContext, name: str = '[Не задано]'):
    msg = await bot.edit_message_text(
        chat_id=chat,
        message_id=message,
        text='Создание категории:\n\n'
             f'Название: {name}\n',
        reply_markup=create_inline_category()
    )

    await state.update_data(category_msg_change=msg.message_id)
