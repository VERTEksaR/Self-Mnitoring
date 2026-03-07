import aiohttp

from aiogram.fsm.context import FSMContext
from aiogram.types import Message

from telegram_bot.loader import my_router, bot
from telegram_bot.config_data.config import APP_API
from telegram_bot.states.data import Register


@my_router.message(Register.email)
async def process_email(message: Message, state: FSMContext):
    data = await state.get_data()
    prompt_msg_id = data['prompt_msg_id']
    await message.delete()
    await bot.delete_message(message.chat.id, prompt_msg_id)

    await state.update_data(email=message.text)
    msg = await message.answer('Введите никнейм:')
    await state.update_data(prompt_msg_id=msg.message_id)
    await state.set_state(Register.nickname)


@my_router.message(Register.nickname)
async def process_nickname(message: Message, state: FSMContext):
    data = await state.get_data()
    prompt_msg_id = data['prompt_msg_id']
    await message.delete()
    await bot.delete_message(message.chat.id, prompt_msg_id)

    await state.update_data(nickname=message.text)
    msg = await message.answer('Введите пароль:')
    await state.update_data(prompt_msg_id=msg.message_id)
    await state.set_state(Register.password)


@my_router.message(Register.password)
async def logon(message: Message, state: FSMContext):
    data = await state.get_data()

    prompt_msg_id = data['prompt_msg_id']
    await message.delete()
    await bot.delete_message(message.chat.id, prompt_msg_id)

    email = data['email']
    nickname = data['nickname']
    password = message.text

    async with aiohttp.ClientSession() as session:
        async with session.post(
            APP_API + '/auth/register', json={
                'email': email,
                'password': password,
                'nickname': nickname,
                'is_admin': False,
                'telegram_id': str(message.from_user.id)
            }
        ) as response:
            print(response.text)
            await state.clear()

