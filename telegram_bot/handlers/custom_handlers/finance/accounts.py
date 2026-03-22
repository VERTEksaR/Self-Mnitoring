import aiohttp

from aiogram.fsm.context import FSMContext
from aiogram.types import Message

from telegram_bot.keyboards.inline import login_logon
from telegram_bot.keyboards.inline.buttons_accounts import accounts
from telegram_bot.loader import my_router, bot
from telegram_bot.config_data.config import APP_API
from telegram_bot.states.data import Account
from telegram_bot.utils.misc.first_connect import first_connect


@my_router.message(Account.name)
async def process_account(message: Message, state: FSMContext):
    data = await state.get_data()

    account_msg_id = data['account_msg_id']
    await message.delete()
    await bot.delete_message(message.chat.id, account_msg_id)

    account_data = {'name': message.text, 'user_id': message.from_user.id}

    async with aiohttp.ClientSession() as session:
        token = await first_connect(message.from_user.id)

        if token:
            async with session.post(
                APP_API + '/accounts',
                headers={'Authorization': f'Bearer {token}'},
                json=account_data
            ) as response:
                await message.answer(text=f'Счет {account_data["name"]} создан')
                async with session.get(
                    APP_API + '/accounts',
                    headers={'Authorization': f'Bearer {token}'}
                ) as response_all:
                    data = await response_all.json()
                    await state.clear()
                    await accounts.accounts(message, data, is_created=True)
            await state.clear()
        else:
            await login_logon.login_logon(message, is_created=True)
