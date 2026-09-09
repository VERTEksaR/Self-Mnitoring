import hashlib
import json

from redis.asyncio import Redis


async def make_cache_key(prefix: str, user_id: int, **params) -> str:
    payload = json.dumps(params, sort_keys=True, default=str)
    digest = hashlib.sha256(payload.encode()).hexdigest()[:16]
    return f"{prefix}:{user_id}:{digest}"


async def invalidate_cache(redis_object: Redis, prefix: str, user_id: int) -> None:
    keys = [key async for key in redis_object.scan_iter(match=f"{prefix}:{user_id}:*")]

    if keys:
        await redis_object.delete(*keys)
