import html
import json
import re
import asyncio
from math import ceil

import httpx

from urllib.parse import urlencode
from fastapi import Request, HTTPException, APIRouter, Depends, Query
from fastapi.responses import RedirectResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.finance_app.app.db.redis import get_redis
from backend.finance_app.app.core.config import settings
from backend.finance_app.app.db.models import User, SteamUser, SteamTrackedGamse, ModulesUsers
from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.dependencies.auth import get_achievements
from backend.finance_app.app.schemas.steam import SteamUserCreate, SteamUserRead, SteamTrackedGameRead, SteamTrackedGameCreate

STEAM_ID_RE = re.compile(r"https?://steamcommunity\.com/openid/id/(\d+)")


router = APIRouter()


@router.get("/login")
async def login():
    params = {
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.mode": "checkid_setup",
        "openid.return_to": settings.return_steam_url,
        "openid.realm": settings.base_url,
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
async def get_steam_accounts(current_user: ModulesUsers = Depends(get_achievements), session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(SteamUser).where(SteamUser.user_id == current_user.user_id)
    )
    return result.scalars().all()


@router.post("/link", response_model=SteamUserRead, status_code=201)
async def link_steam(data: SteamUserCreate, current_user: ModulesUsers = Depends(get_achievements), session: AsyncSession = Depends(get_session)):
    existing = await session.execute(
        select(SteamUser)
        .where(SteamUser.steam_id == data.steam_id, SteamUser.user_id == current_user.user_id)
    )
    existing = existing.scalar_one_or_none()

    if existing:
        return existing

    new_entry = SteamUser(steam_id=data.steam_id, user_id=current_user.user_id)
    session.add(new_entry)
    await session.commit()
    await session.refresh(new_entry)
    return new_entry


@router.delete("/link/{steam_id}", status_code=204)
async def unlink_steam(steam_id: str, current_user: ModulesUsers = Depends(get_achievements), session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(SteamUser)
        .where(SteamUser.steam_id == steam_id, SteamUser.user_id == current_user.user_id)
    )
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(404, detail="Привязка не найдена")

    await session.delete(entry)
    await session.commit()


@router.get("/player-info/{steam_id}", status_code=200)
async def get_steam_player_info(steam_id: str, current_user: ModulesUsers = Depends(get_achievements), session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(SteamUser).where(SteamUser.steam_id == steam_id, SteamUser.user_id == current_user.user_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(404, detail="Профиля Steam с таким id у текущего пользователя не найдено")

    redis_object = await get_redis()
    cache_key = f'user_info_{steam_id}_{current_user.user_id}'
    cache = await redis_object.get(cache_key)

    if cache:
        return json.loads(cache)

    async with httpx.AsyncClient(timeout=10) as client:
        data1, data2, data3 = await asyncio.gather(
            fetch(client, f"{settings.steam_profile_info_url}?key={settings.steam_api_key}&steamids={steam_id}"),
            fetch(client, f"{settings.steam_profile_games_url}?key={settings.steam_api_key}&steamid={steam_id}&include_appinfo=true"),
            fetch(client, f"{settings.steam_profile_recent_games}?key={settings.steam_api_key}&steamid={steam_id}&count=7"),
        )

    player = data1.get("response", {}).get("players", [{}])[0]
    games_resp = data2.get("response", {})
    recent_resp = data3.get("response", {})
    playtime_all = sum(g.get("playtime_forever", 0) for g in games_resp.get("games", [])) / 60
    games = list()

    for game in recent_resp.get("games", []):
        games.append({
            "name": game.get("name", ""),
            "playtime_total": game.get("playtime_forever", 0) / 60,
            "playtime_2weeks": game.get("playtime_2weeks", 0) / 60,
            "image": f"https://cdn.akamai.steamstatic.com/steam/apps/{game.get('appid')}/header.jpg",
        })

    result = {
        "personaname": player.get("personaname", ""),
        "steamid": player.get("steamid", ""),
        "timecreated": player.get("timecreated", 0),
        "personastate": player.get("personastate", 0),
        "avatarfull": player.get("avatarfull", ""),
        "game_count": games_resp.get("game_count", 0),
        "playtime": round(playtime_all),
        "games": games,
    }
    await redis_object.set(cache_key, json.dumps(result), ex=3600)
    return result


async def fetch(client: httpx.AsyncClient, url: str) -> dict:
    try:
        r = await client.get(url)
        r.raise_for_status()
        return r.json()
    except Exception:
        return {}


@router.get("/tracked-games/{steam_id}", status_code=200)
async def get_tracked_games(steam_id: str, page: int = 1, size: int = 10, session: AsyncSession = Depends(get_session), current_user: ModulesUsers = Depends(get_achievements)):
    su = await session.execute(select(SteamUser).where(SteamUser.steam_id == steam_id, SteamUser.user_id == current_user.user_id))
    if not su.scalar_one_or_none():
        raise HTTPException(404, detail="Аккаунт Steam не найден")

    total_result = await session.execute(
        select(func.count()).select_from(SteamTrackedGamse).where(SteamTrackedGamse.steam_id == steam_id)
    )
    total = total_result.scalar_one()

    result = await session.execute(
        select(SteamTrackedGamse)
        .where(SteamTrackedGamse.steam_id == steam_id)
        .offset((page - 1) * size)
        .limit(size)
    )
    games = result.scalars().all()
    items = [{"appid": g.app_id, "game_name": g.game_name} for g in games]
    pages = ceil(total / size) if total > 0 else 1
    return {"items": items, "total": total, "pages": pages, "page": page, "size": size}


@router.post("/tracked-games/{steam_id}", response_model=SteamTrackedGameRead, status_code=201)
async def create_tracked_game(steam_id: str, data: SteamTrackedGameCreate, session: AsyncSession = Depends(get_session), current_user: ModulesUsers = Depends(get_achievements)):
    su = await session.execute(select(SteamUser).where(SteamUser.steam_id == steam_id, SteamUser.user_id == current_user.user_id))
    if not su.scalar_one_or_none():
        raise HTTPException(404, detail="Аккаунт Steam не найден")

    existing = await session.execute(
        select(SteamTrackedGamse).where(SteamTrackedGamse.steam_id == steam_id, SteamTrackedGamse.app_id == data.appid)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(409, detail="Игра уже добавлена")

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            settings.steam_profile_games_url,
            params={
                "key": settings.steam_api_key,
                "format": "json",
                "input_json": json.dumps({
                    "steamid": steam_id,
                    "appids_filter": [data.appid],
                    "include_appinfo": True,
                }),
            }
        )
        response.raise_for_status()
        body = response.json()

    games_list = body.get("response", {}).get("games", [])
    if not games_list:
        raise HTTPException(400, detail="Игра не найдена в библиотеке пользователя")

    tracked_game = SteamTrackedGamse(steam_id=steam_id, app_id=data.appid, game_name=games_list[0]["name"])
    session.add(tracked_game)
    await session.commit()
    await session.refresh(tracked_game)
    return tracked_game


@router.delete("/tracked-games/{steam_id}/{appid}", status_code=204)
async def delete_tracked_app(steam_id: str, appid: int, session: AsyncSession = Depends(get_session), current_user: ModulesUsers = Depends(get_achievements)):
    result = await session.execute(
        select(SteamTrackedGamse).where(SteamTrackedGamse.steam_id == steam_id, SteamTrackedGamse.app_id == appid)
    )
    tracked_game = result.scalar_one_or_none()

    if not tracked_game:
        raise HTTPException(status_code=404, detail="У пользователя нет такой игры")

    await session.delete(tracked_game)
    await session.commit()


@router.get("/news/{steam_id}", status_code=200)
async def get_news(steam_id: str, appids: list[int] = Query(...), count: int = 5, session: AsyncSession = Depends(get_session), current_user: ModulesUsers = Depends(get_achievements)):
    keys = [f"steam:news:{steam_id}:{appid}" for appid in appids]

    redis_object = await get_redis()
    cached = await redis_object.mget(*keys)
    hits, misses = {}, []

    for appid, value in zip(appids, cached):
        if value:
            hits[str(appid)] = json.loads(value)
        else:
            misses.append(appid)

    if misses:
        async with httpx.AsyncClient(timeout=10) as client:
            results = await asyncio.gather(*[
                fetch(client, f"{settings.steam_profile_games_news}?appid={appid}&count={count}&maxlength=200&format=json")
                for appid in misses
            ])

        for app_id, data in zip(misses, results):
            news = data.get("appnews", {})

            if news.get("newsitems", False):
                json_data = [
                    {
                        "title": new.get("title"),
                        "url": new.get("url"),
                        "date": new.get("date"),
                        "contents": clean_news_contents(new.get("contents", "")),
                    } for new in news["newsitems"]
                ]
                await redis_object.set(f"steam:news:{steam_id}:{app_id}", json.dumps(json_data), ex=86400)
                hits[str(app_id)] = json_data

    return hits


@router.get("/ach-summary/{steam_id}", status_code=200)
async def get_achievements_summary(steam_id: str, appids: list[int] = Query(...), session: AsyncSession = Depends(get_session), current_user: ModulesUsers = Depends(get_achievements)):
    keys = [f"steam:ach:{steam_id}:{appid}" for appid in appids]

    redis_object = await get_redis()
    cached = await redis_object.mget(*keys)
    hits, misses = {}, []

    for appid, value in zip(appids, cached):
        if value:
            hits[str(appid)] = json.loads(value)
        else:
            misses.append(appid)

    if misses:
        async with httpx.AsyncClient(timeout=10) as client:
            results = await asyncio.gather(*[
                fetch(client, f"{settings.steam_profile_games_achievements}?appid={appid}&key={settings.steam_api_key}&steamid={steam_id}&l=english")
                for appid in misses
            ])

        for app_id, data in zip(misses, results):
            achievements = data.get("playerstats", {}).get("achievements", [])
            json_data = {
                "total": len(achievements),
                "achieved": sum(1 for x in achievements if x.get("achieved") == 1),
            }
            await redis_object.set(f"steam:ach:{steam_id}:{app_id}", json.dumps(json_data), ex=86400)
            hits[str(app_id)] = json_data

    return hits


@router.get("/ach-detail/{steam_id}/{appid}", status_code=200)
async def get_achievement_detail(steam_id: str, appid: int, session: AsyncSession = Depends(get_session), current_user: ModulesUsers = Depends(get_achievements)):
    result = await session.execute(
        select(SteamTrackedGamse).where(SteamTrackedGamse.steam_id == steam_id, SteamTrackedGamse.app_id == appid)
    )
    tracked_game = result.scalar_one_or_none()

    if not tracked_game:
        raise HTTPException(status_code=404, detail="Такой игры у пользователя нет")

    redis_object = await get_redis()
    cache_key = f"steam:ach:detail:{steam_id}:{appid}"
    cached = await redis_object.get(cache_key)
    if cached:
        return json.loads(cached)

    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            settings.steam_profile_games_achievements,
            params={"appid": appid, "steamid": steam_id, "key": settings.steam_api_key, "l": "english"},
        )
        r.raise_for_status()
        body = r.json()

    achievements_raw = body.get("playerstats", {}).get("achievements", [])
    if not achievements_raw:
        raise HTTPException(status_code=404, detail="У игры нет достижений")

    achievements = [
        {
            "apiname": a.get("apiname", ""),
            "name": a.get("name", a.get("apiname", "")),
            "description": a.get("description", ""),
            "achieved": bool(a.get("achieved", 0)),
            "unlock_time": a.get("unlocktime", 0),
        }
        for a in achievements_raw
    ]
    response_data = {
        "game_name": tracked_game.game_name,
        "total": len(achievements),
        "achieved_count": sum(1 for a in achievements if a["achieved"]),
        "achievements": achievements,
    }
    await redis_object.set(cache_key, json.dumps(response_data), ex=86400)
    return response_data


NEWS_IMAGE_PREFIX_RE = re.compile(r'^(?:.*?\.(?:png|jpe?g|gif)\s*)+')
NEWS_TAG_RE = re.compile(r'<[^>]+>|\[/?\w+(?:=[^]]*)?\]')


def clean_news_contents(text: str) -> str:
    text = NEWS_IMAGE_PREFIX_RE.sub('', text)
    text = NEWS_TAG_RE.sub('', text)
    return html.unescape(text).strip()

