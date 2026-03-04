async def get_object(session, model, ids):
    result = await session.get(model, ids)
    return result