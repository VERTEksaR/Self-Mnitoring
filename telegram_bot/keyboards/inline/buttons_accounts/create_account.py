from aiogram.fsm.context import FSMContext
from aiogram.types import InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from telegram_bot.loader import bot


def create_inline_account():
    account_button = InlineKeyboardBuilder()

    button_change_name = InlineKeyboardButton(text='Изменить название', callback_data='account_name_change')
    button_save = InlineKeyboardButton(text='Сохранить', callback_data='account_save')
    account_button.row(button_change_name)
    account_button.row(button_save)

    return account_button.as_markup()


async def create_account(chat: int, message: int, state: FSMContext, name: str = '[Не задано]'):
    msg = await bot.edit_message_text(
        chat_id=chat,
        message_id=message,
        text='Создание счета:\n\n'
             f'Название: {name}\n',
        reply_markup=create_inline_account()
    )

    await state.update_data(account_msg_change=msg.message_id)
