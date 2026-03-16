from aiogram import F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup
from aiogram.types import InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from telegram_bot.config_data.config import APP_API
from telegram_bot.loader import bot, my_router
from telegram_bot.states.data import Choice, Finance


async def categories(message: Message, data: dict):
    categories_button = InlineKeyboardBuilder()

    for element in data['items'][:5]:
        button = InlineKeyboardButton(text=f"{element['id']} | {element['name']}", callback_data='category_{}'.format(element['id']))
        categories_button.row(button)

    button_next = InlineKeyboardButton(text='>', callback_data='category_next')
    button_previous = InlineKeyboardButton(text='<', callback_data='category_previous')
    button_total = InlineKeyboardButton(text=str(data['total']), callback_data='category_total')
    categories_button.row(button_previous, button_total, button_next)

    await message.answer(text='Категории', reply_markup=categories_button.as_markup())