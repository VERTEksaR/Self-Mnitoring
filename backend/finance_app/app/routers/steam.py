import re
import httpx

from urllib.parse import urlencode
from fastapi import Request, HTTPException, APIRouter
from fastapi.responses import RedirectResponse
from starlette import status

from backend.finance_app.app.core.config import settings

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

    if params.get("openid.mode") != "id_res":
        raise HTTPException(401, detail="Авторизация Steam отменена или некорректна")

    verify = dict(params)
    verify["openid.mode"] = "check_authentication"

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(settings.steam_openid_url, data=verify)

    if "is_valid:true" in response.text:
        is_checked = True

    if not is_checked:
        raise HTTPException(401, detail="Не удалось подтвердить вход через Steam")

    user_id = params.get("openid.claimed_id", "")
    match = STEAM_ID_RE.match(user_id)

    if not match:
        raise HTTPException(400, detail="Не удалось получить id пользователя")

    steam_id = match.group(1)
    return RedirectResponse(f"{settings.base_url}/steam?steam_id={steam_id}")
