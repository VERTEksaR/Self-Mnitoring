import aiohttp

from aiogram.fsm.context import FSMContext
from aiogram.types import Message

from telegram_bot.loader import my_router, bot
from telegram_bot.config_data.config import APP_API
from telegram_bot.states.data import Auth


@my_router.message(Auth.email)
async def process_email(message: Message, state: FSMContext):
    data = await state.get_data()
    prompt_msg_id = data['prompt_msg_id']
    await message.delete()
    await bot.delete_message(message.chat.id, prompt_msg_id)

    await state.update_data(email=message.text)
    msg = await message.answer('Введите пароль:')
    await state.update_data(prompt_msg_id=msg.message_id)
    await state.set_state(Auth.password)

@my_router.message(Auth.password)
async def login(message: Message, state: FSMContext):
    data = await state.get_data()

    prompt_msg_id = data['prompt_msg_id']
    await message.delete()
    await bot.delete_message(message.chat.id, prompt_msg_id)

    email = data['email']
    password = message.text

    async with aiohttp.ClientSession() as session:
        async with session.post(
            APP_API + '/auth/login', json={
                'email': email,
                'password': password
            }
        ) as response:
            print(response.text)
            await state.clear()