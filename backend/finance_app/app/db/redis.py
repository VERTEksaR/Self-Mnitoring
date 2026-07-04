from redis import asyncio as redis
from backend.finance_app.app.core.config import settings

redis_client = redis.Redis(
    host=settings.redis_host,
    port=settings.redis_port,
    decode_responses=True,
)


async def get_redis() -> redis.Redis:
    return redis_client
