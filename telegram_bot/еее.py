import aiohttp
import asyncio
import socket

async def test():
    connector = aiohttp.TCPConnector(family=socket.AF_INET)
    timeout = aiohttp.ClientTimeout(total=60)
    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        async with session.get("https://api.telegram.org") as resp:
            print(resp.status)

asyncio.run(test())