import aiohttp
from aiogram import F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from telegram_bot.config_data.config import APP_API
from telegram_bot.keyboards.inline import login_logon, finance_choice
from telegram_bot.keyboards.inline.buttons_categories import category, create_category
from telegram_bot.loader import my_router, bot
from telegram_bot.states.data import Category
from telegram_bot.utils.misc.first_connect import first_connect


async def categories(message: Message, data: dict, is_created=False):
    categories_button = InlineKeyboardBuilder()

    for element in data['items']:
        button = InlineKeyboardButton(text=f"{element['id']} | {element['name']}", callback_data=f"category_{element['id']}")
        categories_button.row(button)

    button_next = InlineKeyboardButton(text='>', callback_data=f'category_next_{data["page"]}')
    button_previous = InlineKeyboardButton(text='<', callback_data=f'category_previous_{data["page"]}')
    button_add = InlineKeyboardButton(text='+', callback_data='category_plus')
    button_back = InlineKeyboardButton(text='Назад', callback_data='category_back')
    categories_button.row(button_previous, button_add, button_next)
    categories_button.row(button_back)

    if not is_created:
        await message.edit_text(text='Категории.\n'
                                     f'Общее количество: {data["total"]}\n'
                                     f'Страница: {data["page"]}', reply_markup=categories_button.as_markup())
    else:
        await message.answer(text='Категории.\n'
                                    f'Общее количество: {data["total"]}\n'
                                    f'Страница: {data["page"]}', reply_markup=categories_button.as_markup())


@my_router.callback_query(F.data.contains("category"))
async def categories_callback(callback: CallbackQuery, state:FSMContext):
    if 'plus' in callback.data:
        await create_category.create_category(chat=callback.message.chat.id,
                                              message=callback.message.message_id, state=state)
        # msg = await callback.message.answer("Введите название:")
        # await state.update_data(category_msg_id=msg.message_id)
        # await state.set_state(Category.name)
    elif 'name_change' in callback.data:
        msg = await callback.message.answer("Введите название:")
        data = await state.get_data()

        category_msg_id = data['category_msg_id']
        category_msg_change = data['category_msg_change']
        await callback.message.delete()
        await bot.delete_message(callback.message.chat.id, category_msg_id)

        await state.update_data(category_msg_id=msg.message_id)
        await create_category.create_category(chat=callback.message.chat.id,
                                              message=category_msg_change,
                                              state=state, name=callback.message.text)
    elif 'next' in callback.data:
        async with aiohttp.ClientSession() as session:
            token = await first_connect(callback.from_user.id)

            if token:
                async with session.get(
                    APP_API + '/categories',
                    headers={'Authorization': f'Bearer {token}'},
                    params={'page': int(callback.data.split('_')[-1]) + 1}
                ) as response:
                    data = await response.json()
                    await categories(callback.message, data)
            else:
                await login_logon.login_logon(callback.message, is_created=True)
    elif 'previous' in callback.data:
        async with aiohttp.ClientSession() as session:
            token = await first_connect(callback.from_user.id)

            if token and int(callback.data.split('_')[-1]) - 1 >= 1:
                async with session.get(
                    APP_API + '/categories',
                    headers={'Authorization': f'Bearer {token}'},
                    params={'page': int(callback.data.split('_')[-1]) - 1}
                ) as response:
                    data = await response.json()
                    await categories(callback.message, data)
            else:
                await login_logon.login_logon(callback.message, is_created=True)
    elif 'delete' in callback.data:
        async with aiohttp.ClientSession() as session:
            token = await first_connect(callback.from_user.id)

            if token:
                async with session.delete(
                    APP_API + f'/categories/{callback.data.split("_")[1]}',
                    headers={'Authorization': f'Bearer {token}'}
                ) as response:
                    if response.status == 204:
                        async with session.get(
                            APP_API + '/categories',
                            headers={'Authorization': f'Bearer {token}'}
                        ) as response_other:
                            data = await response_other.json()
                            await categories(callback.message, data)
            else:
                await login_logon.login_logon(callback.message, is_created=True)
    elif 'back' in callback.data:
        token = await first_connect(callback.from_user.id)

        if token:
            await finance_choice.choice_finance(callback.message, is_created=True)
        else:
            await login_logon.login_logon(callback.message, is_created=True)
    elif 'save' in callback.data:
        data = await state.get_data()
        name = data['category_name']

        category_data = {'name': name, 'user_id': callback.message.from_user.id}

        async with aiohttp.ClientSession() as session:
            token = await first_connect(callback.from_user.id)

            if token:
                async with session.post(
                    APP_API + '/categories',
                    headers={'Authorization': f'Bearer {token}'},
                    json=category_data
                ) as response:
                    if response.status != 400:
                        await callback.message.answer(text=f'Категория {category_data["name"]} создана')
                        async with session.get(
                                APP_API + '/categories',
                                headers={'Authorization': f'Bearer {token}'}
                        ) as response_all:
                            data = await response_all.json()
                            await state.clear()
                            await categories(callback.message, data, is_created=True)
                    else:
                        await callback.message.answer(text=f'Ошибка: категория с именем {category_data["name"]} уже существует')
                await state.clear()
            else:
                await login_logon.login_logon(callback.message, is_created=True)
    else:
        async with aiohttp.ClientSession() as session:
            token = await first_connect(callback.from_user.id)

            if token:
                async with session.get(
                    APP_API + f'/categories/{callback.data.split("_")[1]}',
                    headers={'Authorization': f'Bearer {token}'}
                ) as response:
                    data = await response.json()
                    await category.category(callback.message, data)
            else:
                await login_logon.login_logon(callback.message, is_created=True)
