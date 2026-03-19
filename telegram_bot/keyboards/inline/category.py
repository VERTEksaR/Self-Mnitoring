import aiohttp
from aiogram import F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup
from aiogram.types import InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from telegram_bot.config_data.config import APP_API
from telegram_bot.loader import my_router
from telegram_bot.states.data import Category


async def category(message:Message, data: dict):
    category_button = InlineKeyboardBuilder()

    btn1 = InlineKeyboardButton(text="Удалить", callback_data=f'category_{data["id"]}_delete')
    btn2 = InlineKeyboardButton(text="Назад", callback_data='Categories')
    category_button.row(btn1, btn2)

    await message.answer(text=f'Название: {data["name"]}', reply_markup=category_button.as_markup())