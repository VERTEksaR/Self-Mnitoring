from aiogram.types import Message, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder


async def account(message: Message, data: dict):
    account_button = InlineKeyboardBuilder()

    btn1 = InlineKeyboardButton(text="Удалить", callback_data=f'account_{data["id"]}_delete')
    btn2 = InlineKeyboardButton(text="Назад", callback_data='Accounts')
    account_button.row(btn1, btn2)

    await message.edit_text(text=f'Название: {data["name"]}', reply_markup=account_button.as_markup())