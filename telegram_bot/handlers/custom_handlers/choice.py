from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.types import Message

from telegram_bot.loader import my_router
from telegram_bot.keyboards.inline import finance_choice


@my_router.message(Command(commands=["finance"]))
async def choice_finance(message: Message):
    await finance_choice.choice_finance(message)


@my_router.message(Command(commands=["training"]))
async def choice_training(state: FSMContext):
    await state.update_data({'training': True})


@my_router.message(Command(commands=["food"]))
async def choice_food(state: FSMContext):
    await state.update_data({'food': True})


@my_router.message(Command(commands=["achievements"]))
async def choice_achievements(state: FSMContext):
    await state.update_data({'achievements': True})


@my_router.message(Command(commands=["languages"]))
async def choice_achievements(state: FSMContext):
    await state.update_data({'languages': True})