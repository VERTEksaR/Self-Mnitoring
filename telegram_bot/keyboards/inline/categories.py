import aiohttp
from aiogram import F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup
from aiogram.types import InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from telegram_bot.config_data.config import APP_API
from telegram_bot.keyboards.inline import category
from telegram_bot.loader import my_router
from telegram_bot.states.data import Category
from telegram_bot.utils.misc.first_connect import first_connect


async def categories(message: Message, data: dict):
    categories_button = InlineKeyboardBuilder()

    for element in data['items'][:5]:
        button = InlineKeyboardButton(text=f"{element['id']} | {element['name']}", callback_data='category_{}'.format(element['id']))
        categories_button.row(button)

    button_next = InlineKeyboardButton(text='>', callback_data='category_next')
    button_previous = InlineKeyboardButton(text='<', callback_data='category_previous')
    button_total = InlineKeyboardButton(text='+', callback_data='category_plus')
    categories_button.row(button_previous, button_total, button_next)

    await message.answer(text='Категории.\n'
                              f'Общее количество: {data["total"]}', reply_markup=categories_button.as_markup())


@my_router.callback_query(F.data.contains("category"))
async def categories_callback(callback: CallbackQuery, state:FSMContext):
    if 'plus' in callback.data:
        msg = await callback.message.answer("Введите название:")
        await state.update_data(category_msg_id=msg.message_id)
        await state.set_state(Category.name)
    elif 'delete' in callback.data:
        async with aiohttp.ClientSession() as session:
            token = await first_connect(callback.from_user.id)

            if token:
                async with session.delete(
                    APP_API + f'/categories/{callback.data.split("_")[1]}',
                    headers={'Authorization': f'Bearer {token}'}
                ) as response:
                    if response.status == 200:
                        async with session.get(
                                APP_API + '/categories',
                                headers={'Authorization': f'Bearer {token}'}
                        ) as response_other:
                            data = await response_other.json()
                            await categories(callback.message, data)
            else:
                await callback.message.answer("Срок токена истек. Необходимо войти заново")
    else:
        async with aiohttp.ClientSession() as session:
            token = await first_connect(callback.from_user.id)

            if token:
                async with session.get(
                    APP_API + f'/categories/{callback.data.split("_")[1]}',
                    headers={'Authorization': f'Bearer {token}'}
                ) as response:
                    data = await response.json()
                    print(data)
                    await category.category(callback.message, data)
            else:
                await callback.message.answer("Срок токена истек. Необходимо войти заново")
