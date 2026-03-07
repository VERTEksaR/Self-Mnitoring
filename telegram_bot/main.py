import asyncio

from handlers import my_router
from loader import bot, dp
from utils.set_bot_commands import set_default_commands


async def main():
    print("I have been started up")

    await set_default_commands()
    dp.include_router(my_router)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())