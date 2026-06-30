import re
import httpx

from urllib.parse import urlencode
from fastapi import Request, HTTPException, APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.finance_app.app.core.config import settings
from backend.finance_app.app.db.models import User, SteamUser
from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.dependencies.auth import get_current_user
from backend.finance_app.app.schemas.steam import SteamUserCreate, SteamUserRead

STEAM_ID_RE = re.compile(r"https?://steamcommunity\.com/openid/id/(\d+)")


router = APIRouter()


@router.get("/login")
async def login():
    params = {
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.mode": "checkid_setup",
        "openid.return_to": settings.return_steam_url,
        "openid.realm": settings.base_url,
        # Просим Steam сам определить identity пользователя:
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    }
    return RedirectResponse(f"{settings.steam_openid_url}?{urlencode(params)}")


@router.get("/auth/callback", status_code=200)
async def steam_callback(request: Request):
    is_checked = False

    params = dict(request.query_params)
    print(params)

    if params.get("openid.mode") != "id_res":
        raise HTTPException(401, detail="Авторизация Steam отменена или некорректна")

    verify = dict(params)
    verify["openid.mode"] = "check_authentication"

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(settings.steam_openid_url, data=verify)

    if "is_valid:true" in response.text:
        is_checked = True

    print(response.text)

    if not is_checked:
        raise HTTPException(401, detail="Не удалось подтвердить вход через Steam")

    user_id = params.get("openid.claimed_id", "")
    match = STEAM_ID_RE.match(user_id)

    if not match:
        raise HTTPException(400, detail="Не удалось получить id пользователя")

    steam_id = match.group(1)
    return RedirectResponse(f"{settings.base_url.rstrip('/')}/steam?steam_id={steam_id}")


@router.get("/accounts", response_model=list[SteamUserRead])
async def get_steam_accounts(current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(SteamUser).where(SteamUser.user_id == current_user.id)
    )
    return result.scalars().all()


@router.post("/link", response_model=SteamUserRead, status_code=201)
async def link_steam(data: SteamUserCreate, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    existing = await session.execute(
        select(SteamUser)
        .where(SteamUser.steam_id == data.steam_id, SteamUser.user_id == current_user.id)
    )
    existing = existing.scalar_one_or_none()

    if existing:
        return existing

    new_entry = SteamUser(steam_id=data.steam_id, user_id=current_user.id)
    session.add(new_entry)
    await session.commit()
    await session.refresh(new_entry)
    return new_entry


@router.delete("/link/{steam_id}", status_code=204)
async def unlink_steam(steam_id: str, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(SteamUser)
        .where(SteamUser.steam_id == steam_id, SteamUser.user_id == current_user.id)
    )
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(404, detail="Привязка не найдена")

    await session.delete(entry)
    await session.commit()
