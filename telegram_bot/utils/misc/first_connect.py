import aiohttp

from telegram_bot.config_data.config import APP_API


async def first_connect(telegram_id):
    async with aiohttp.ClientSession() as session:
        async with session.get(
                APP_API + '/telegram',
                params={"telegram_id": telegram_id, 'app_id': 2}
        ) as response:
            data = await response.json()
            token = data['access_token']
            return token