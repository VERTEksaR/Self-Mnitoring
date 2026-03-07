from aiogram import F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery
from aiogram.types import InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from telegram_bot.loader import my_router
from telegram_bot.states.data import Auth, Register


async def login_logon(message: Message):
    login_logon_button = InlineKeyboardBuilder()

    btn1 = InlineKeyboardButton(text='Зарегистрироваться', callback_data='logon')
    btn2 = InlineKeyboardButton(text='Войти', callback_data='login')
    login_logon_button.add(btn1, btn2)
    await message.answer(text="Привет!\n"
        "Для использования бота необходимо авторизоваться\n",
                         reply_markup=login_logon_button.as_markup())


@my_router.callback_query(F.data.in_(('logon', 'login')))
async def login_logon_callback(callback: CallbackQuery, state: FSMContext):
    if callback.data == 'login':
        msg = await callback.message.answer("Введите email:")
        await state.update_data(prompt_msg_id=msg.message_id)
        await state.set_state(Auth.email)
    elif callback.data == 'logon':
        msg = await callback.message.answer("Введите email:")
        await state.update_data(prompt_msg_id=msg.message_id)
        await state.set_state(Register.email)


