import aiohttp
from aiogram import F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery
from aiogram.types import InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from telegram_bot.config_data.config import APP_API
from telegram_bot.loader import my_router
from telegram_bot.keyboards.inline.buttons_categories import categories
from telegram_bot.keyboards.inline.buttons_accounts import accounts
from telegram_bot.utils.misc.first_connect import first_connect


async def choice_finance(message: Message, is_created: bool = False):
    choices = InlineKeyboardBuilder()

    btn1 = InlineKeyboardButton(text='Категории', callback_data='Categories')
    btn2 = InlineKeyboardButton(text='Счета', callback_data='Accounts')
    btn3 = InlineKeyboardButton(text='Транзакции', callback_data='Transactions')
    choices.add(btn1, btn2, btn3)

    if not is_created:
        await message.answer(text='Выбери один из пунктов:', reply_markup=choices.as_markup())
    else:
        await message.edit_text(text='Выбери один из пунктов:', reply_markup=choices.as_markup())


@my_router.callback_query(F.data.in_(('Categories', 'Accounts', 'Transactions')))
async def finance_callback_choice(callback: CallbackQuery, state: FSMContext):
    if callback.data == 'Categories':
        async with aiohttp.ClientSession() as session:
            token = await first_connect(callback.from_user.id)

            if token:
                async with session.get(
                    APP_API + '/categories',
                    headers={'Authorization': f'Bearer {token}'}
                ) as response:
                    data = await response.json()
                    await categories.categories(callback.message, data)
            else:
                await callback.message.answer("Срок токена истек. Необходимо войти заново")
    elif callback.data == 'Accounts':
        async with aiohttp.ClientSession() as session:
            token = await first_connect(callback.from_user.id)

            if token:
                async with session.get(
                    APP_API + '/accounts',
                    headers={'Authorization': f'Bearer {token}'}
                ) as response:
                    data = await response.json()
                    await accounts.accounts(callback.message, data)
            else:
                await callback.message.answer("Срок токена истек. Необходимо войти заново")

