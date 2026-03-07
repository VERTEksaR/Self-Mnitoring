from aiogram import F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup
from aiogram.types import InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from telegram_bot.loader import bot, my_router
from telegram_bot.states.data import Choice, Finance


async def choice_finance(message: Message):
    choices = InlineKeyboardBuilder()

    btn1 = InlineKeyboardButton(text='Категории', callback_data='btn1')
    btn2 = InlineKeyboardButton(text='Счета', callback_data='btn2')
    btn3 = InlineKeyboardButton(text='Транзакции', callback_data='btn3')
    choices.add(btn1, btn2, btn3)

    await message.answer(text='Выбери один из пунктов:', reply_markup=choices.as_markup())


# @my_router.callback_query(F.data.in_(('btn1', 'btn2', 'btn3')))
# async def finance_callback_choice(callback: CallbackQuery, state: FSMContext):
#     if callback.data == 'btn1':

