import os
from dotenv import load_dotenv, find_dotenv

if not find_dotenv():
    exit("Переменные окружения не загружены т.к отсутствует файл .env")
else:
    load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
APP_API = os.getenv("APP_API")
DEFAULT_COMMANDS = (
    ("start", "Запустить бота"),
    ('finance', 'Финансы'),
    ('training', 'Тренировки'),
    ('food', 'Питание'),
    ('achievements', 'Достижения'),
    # ("help", "Вывести справку")
)