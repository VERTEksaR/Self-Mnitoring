from aiogram.types import Message, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder


async def category(message: Message, data: dict):
    category_button = InlineKeyboardBuilder()

    btn1 = InlineKeyboardButton(text="Удалить", callback_data=f'category_{data["id"]}_delete')
    btn2 = InlineKeyboardButton(text="Назад", callback_data='Categories')
    category_button.row(btn1, btn2)

    await message.edit_text(text=f'Название: {data["name"]}', reply_markup=category_button.as_markup())