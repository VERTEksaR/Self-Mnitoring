from aiogram.fsm.state import State, StatesGroup


class Choice(StatesGroup):
    finance = State()
    training = State()
    food = State()
    achievements = State()