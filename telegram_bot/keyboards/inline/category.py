import aiohttp
from aiogram import F
from aiogram.fsm.context import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from telegram_bot.config_data.config import APP_API
from telegram_bot.loader import my_router
from telegram_bot.states.data import Category


async def category(message:Message, data: dict):
