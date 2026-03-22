import aiohttp
from aiogram import F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from telegram_bot.config_data.config import APP_API
from telegram_bot.keyboards.inline import account, login_logon, finance_choice
from telegram_bot.loader import my_router
from telegram_bot.states.data import Account
from telegram_bot.utils.misc.first_connect import first_connect


async def accounts(message: Message, data: dict, is_created=False):
    accounts_button = InlineKeyboardBuilder()

    for element in data['items']:
        button = InlineKeyboardButton(text=f"{element['id']} | {element['name']}", callback_data=f"account_{element['id']}")
        accounts_button.row(button)

    button_next = InlineKeyboardButton(text='>', callback_data=f'account_next_{data["page"]}')
    button_previous = InlineKeyboardButton(text='<', callback_data=f'account_previous_{data["page"]}')
    button_add = InlineKeyboardButton(text='+', callback_data=f'account_plus')
    button_back = InlineKeyboardButton(text='Назад', callback_data=f'account_back')
    accounts_button.row(button_previous, button_add, button_next)
    accounts_button.row(button_back)

    if not is_created:
        await message.edit_text(text='Счета.\n'
                                     f'Общее количество: {data["total"]}\n'
                                     f'Страница: {data["page"]}', reply_markup=accounts_button.as_markup())
    else:
        await message.answer(text='Счета.\n'
                                     f'Общее количество: {data["total"]}\n'
                                     f'Страница: {data["page"]}', reply_markup=accounts_button.as_markup())


@my_router.callback_query(F.data.contains("account"))
async def accounts_callback(callback: CallbackQuery, state: FSMContext):
    if 'plus' in callback.data:
        msg = await callback.message.answer('Введите название:')
        await state.update_data(account_msg_id=msg.message_id)
        await state.set_state(Account.name)
    elif 'next' in callback.data:
        async with aiohttp.ClientSession() as session:
            token = await first_connect(callback.from_user.id)

            if token:
                async with session.get(
                    APP_API + '/accounts',
                    headers={'Authorization': f'Bearer {token}'},
                    params={'page': int(callback.data.split('_')[-1]) + 1}
                ) as response:
                    data = await response.json()
                    await accounts(callback.message, data)
            else:
                await login_logon.login_logon(callback.message, is_created=True)
    elif 'previous' in callback.data:
        async with aiohttp.ClientSession() as session:
            token = await first_connect(callback.from_user.id)

            if token and int(callback.data.split('_')[-1]) - 1 >= 1:
                async with session.get(
                    APP_API + '/accounts',
                    headers={'Authorization': f'Bearer {token}'},
                    params={'page': int(callback.data.split('_')[-1]) - 1}
                ) as response:
                    data = await response.json()
                    await accounts(callback.message, data)
            else:
                await login_logon.login_logon(callback.message, is_created=True)
    elif 'delete' in callback.data:
        async with aiohttp.ClientSession() as session:
            token = await first_connect(callback.from_user.id)

            if token:
                async with session.delete(
                    APP_API + f'/accounts/{callback.data.split("_")[1]}',
                    headers={'Authorization': f'Bearer {token}'},
                ) as response:
                    if response.status == 204:
                        async with session.get(
                            APP_API + 'accounts',
                            headers={'Authorization': f'Bearer {token}'},
                        ) as response_other:
                            data = await response_other.json()
                            await accounts(callback.message, data)
            else:
                await login_logon.login_logon(callback.message, is_created=True)
    elif 'back' in callback.data:
        token = await first_connect(callback.from_user.id)

        if token:
            await finance_choice.choice_finance(callback.message, is_created=True)
        else:
            await login_logon.login_logon(callback.message, is_created=True)
    else:
        async with aiohttp.ClientSession() as session:
            token = await first_connect(callback.from_user.id)

            if token:
                async with session.get(
                    APP_API + f'/accounts/{callback.data.split("_")[1]}',
                    headers={'Authorization': f'Bearer {token}'},
                ) as response:
                    data = await response.json()
                    await account.account(callback.message, data)
            else:
                await login_logon.login_logon(callback.message, is_created=True)