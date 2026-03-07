from aiogram.fsm.state import State, StatesGroup


class Register(StatesGroup):
    nickname = State()
    email = State()
    password = State()
    prompt_msg_id = State()


class Auth(StatesGroup):
    email = State()
    password = State()
    prompt_msg_id = State()

class Choice(StatesGroup):
    finance = State()
    training = State()
    food = State()
    achievements = State()

class Finance(StatesGroup):
    categories = State()