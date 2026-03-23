import aiohttp
from aiogram import F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from telegram_bot.config_data.config import APP_API
# from telegram_bot.keyboards.inline import transaction, login_logon, finance_choice
from telegram_bot.loader import my_router
# from telegram_bot.states.data import Transaction
from telegram_bot.utils.misc.first_connect import first_connect


async def transactions(message: Message, data: dict, is_created: bool = False):
    transactions_button = InlineKeyboardBuilder()

    for element in data['items']:
        button = InlineKeyboardButton(text=f"{element['id']} | {element['name']}", callback_data=f"transaction_{element['id']}")
        transactions_button.row(button)

    button_next = InlineKeyboardButton(text='>', callback_data=f'transaction_next_{data["page"]}')
    button_previous = InlineKeyboardButton(text='<', callback_data=f'transaction_previous_{data["page"]}')
    button_add = InlineKeyboardButton(text='+', callback_data='transaction_plus')
    button_back = InlineKeyboardButton(text='Назад', callback_data='transaction_back')
    transactions_button.row(button_previous, button_add, button_next)
    transactions_button.row(button_back)

    if not is_created:
        await message.edit_text(text='Категории.\n'
                                     f'Общее количество: {data["total"]}\n'
                                     f'Страница: {data["page"]}', reply_markup=transactions_button.as_markup())
    else:
        await message.answer(text='Категории.\n'
                                     f'Общее количество: {data["total"]}\n'
                                     f'Страница: {data["page"]}', reply_markup=transactions_button.as_markup())


# @my_router.callback_query(F.data.contains("transaction"))
# async def transactions_callback(callback: CallbackQuery, state: FSMContext):
#     if 'plus' in callback.data:
#         msg = await callback.message.unswer