import hashlib
import json
import logging

from redis.asyncio import Redis
from redis.exceptions import RedisError

logger = logging.getLogger(__name__)


async def make_cache_key(prefix: str, user_id: int, **params) -> str:
    payload = json.dumps(params, sort_keys=True, default=str)
    digest = hashlib.sha256(payload.encode()).hexdigest()[:16]
    return f"{prefix}:{user_id}:{digest}"


async def safe_get(redis_object: Redis, key: str):
    """Читает значение из Redis, возвращает None, если Redis недоступен."""
    try:
        return await redis_object.get(key)
    except RedisError as e:
        logger.warning(f"Redis недоступен, кэш пропущен (get {key}): {e}")
        return None


async def safe_mget(redis_object: Redis, keys: list) -> list:
    """Читает несколько значений из Redis, возвращает список None, если Redis недоступен."""
    if not keys:
        return []

    try:
        return await redis_object.mget(*keys)
    except RedisError as e:
        logger.warning(f"Redis недоступен, кэш пропущен (mget): {e}")
        return [None] * len(keys)


async def safe_set(redis_object: Redis, key: str, value: str, ex: int = None) -> None:
    """Пишет значение в Redis, молча пропускает запись, если Redis недоступен."""
    try:
        await redis_object.set(key, value, ex=ex)
    except RedisError as e:
        logger.warning(f"Redis недоступен, кэш не записан (set {key}): {e}")


async def invalidate_cache(redis_object: Redis, prefix: str, user_id: int) -> None:
    try:
        keys = [key async for key in redis_object.scan_iter(match=f"{prefix}:{user_id}:*")]

        if keys:
            await redis_object.delete(*keys)
    except RedisError as e:
        logger.warning(f"Redis недоступен, инвалидация кэша пропущена ({prefix}:{user_id}): {e}")
