from aiogram.fsm.context import FSMContext
from aiogram.types import Message

from telegram_bot.keyboards.inline.buttons_accounts import create_account
from telegram_bot.loader import my_router, bot
from telegram_bot.states.data import Account


@my_router.message(Account.account_name)
async def process_account(message: Message, state: FSMContext):
    data = await state.get_data()

    account_msg_id = data['account_msg_id']
    account_msg_change = data['account_msg_change']
    await message.delete()
    await bot.delete_message(message.chat.id, account_msg_id)

    await bot.edit_message_text(
        chat_id=message.chat.id,
        message_id=account_msg_change,
        text='Создание категории:\n\n'
             f'Название: {message.text}\n',
        reply_markup=create_account.create_inline_account()
    )
