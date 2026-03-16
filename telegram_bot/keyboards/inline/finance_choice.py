import aiohttp
from aiogram import F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup
from aiogram.types import InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from telegram_bot.config_data.config import APP_API
from telegram_bot.loader import bot, my_router
from telegram_bot.states.data import Choice, Finance
from telegram_bot.keyboards.inline import categories


async def choice_finance(message: Message):
    choices = InlineKeyboardBuilder()

    btn1 = InlineKeyboardButton(text='Категории', callback_data='Categories')
    btn2 = InlineKeyboardButton(text='Счета', callback_data='Accounts')
    btn3 = InlineKeyboardButton(text='Транзакции', callback_data='Transactions')
    choices.add(btn1, btn2, btn3)

    await message.answer(text='Выбери один из пунктов:', reply_markup=choices.as_markup())


@my_router.callback_query(F.data.in_(('Categories', 'Accounts', 'Transactions')))
async def finance_callback_choice(callback: CallbackQuery, state: FSMContext):
    if callback.data == 'Categories':
        async with aiohttp.ClientSession() as session:
            async with session.get(
                APP_API + '/telegram',
                params={"telegram_id": callback.from_user.id, 'app_id': 2}
            ) as response:
                data = await response.json()
                token = data['access_token']

            async with session.get(
                APP_API + '/categories',
                headers={'Authorization': f'Bearer {token}'}
            ) as response:
                data = await response.json()
                print(data)
                await categories.categories(callback.message, data)



