import logging
import json
from math import ceil

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.finance_app.app.db.models.finances.bank import Bank
from backend.finance_app.app.db.redis import get_redis
from backend.finance_app.app.dependencies.auth import get_finances
from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.db.models import Account, ModulesUsers
from backend.finance_app.app.schemas.common.common import PageNumber, PageSize, Page
from backend.finance_app.app.schemas.finances.banks import BankRead, BankChange, BankCreate
from backend.finance_app.app.utils.commit import commit_or_conflict
from backend.finance_app.app.utils.redis_cache_key import make_cache_key, invalidate_cache, safe_get, safe_set

router = APIRouter()

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s - %(name)s - %(asctime)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@router.get("/{bank_id}/", response_model=BankRead, status_code=200)
async def get_bank(bank_id: int, session: AsyncSession = Depends(get_session),
                   current_user: ModulesUsers = Depends(get_finances)):
    result = await session.execute(
        select(Bank)
        .where(Bank.id == bank_id, Bank.user_id == current_user.user_id)
    )
    bank = result.scalar_one_or_none()

    if not bank:
        logger.error(f"Банк с id {bank_id} не был найден")
        raise HTTPException(status_code=404, detail=f"Банк с id {bank_id} не был найден")

    logger.info(f"Банк с id {bank_id} был найден")
    return bank


@router.patch("/{bank_id}/", response_model=BankRead, status_code=200)
async def change_bank(bank_id: int, data: BankChange, session: AsyncSession = Depends(get_session),
                      current_user: ModulesUsers = Depends(get_finances)):
    result = await session.execute(
        select(Bank)
        .where(Bank.id == bank_id, Bank.user_id == current_user.user_id)
    )
    bank = result.scalar_one_or_none()

    if not bank:
        logger.error(f"Банк с id {bank_id} не был найден")
        raise HTTPException(status_code=404, detail=f"Банк с id {bank_id} не был найден")

    updated_data = data.model_dump(exclude_unset=True)

    for field, value in updated_data.items():
        setattr(bank, field, value)

    await commit_or_conflict(session, f"Банк <<{bank.name}>> уже есть")
    await session.refresh(bank)
    await invalidate_cache(redis_object=await get_redis(),
                           prefix="banks",
                           user_id=current_user.user_id)
    return bank


@router.delete("/{bank_id}/", status_code=204)
async def delete_bank(bank_id: int, session: AsyncSession = Depends(get_session),
                      current_user: ModulesUsers = Depends(get_finances)):
    result = await session.execute(
        select(Bank)
        .where(Bank.id == bank_id, Bank.user_id == current_user.user_id)
    )
    bank = result.scalar_one_or_none()

    if not bank:
        logger.error(f"Банк с id {bank_id} не был найден")
        raise HTTPException(status_code=404, detail=f"Банк с id {bank_id} не был найден")

    has_accounts = await session.scalar(
        select(func.count())
        .select_from(Account)
        .where(Account.bank_id == bank_id)
    )

    if has_accounts:
        raise HTTPException(status_code=409, detail="Нельзя удалить банк, у которого есть счета")

    await session.delete(bank)
    await commit_or_conflict(session, "Нельзя удалить банк: у него есть счета")
    logger.info(f"Банк с id {bank_id} был удален")
    await invalidate_cache(redis_object=await get_redis(),
                           prefix="banks",
                           user_id=current_user.user_id)
    return None


@router.post("/", response_model=BankRead, status_code=201)
async def create_bank(bank_data: BankCreate, session: AsyncSession = Depends(get_session),
                      current_user: ModulesUsers = Depends(get_finances)):
    bank = Bank(**bank_data.model_dump(), user_id=current_user.user_id)
    session.add(bank)
    await commit_or_conflict(session, f"Банк <<{bank.name}>> уже есть")
    logger.info(f"Банк с id {bank.id} был создан")
    await invalidate_cache(redis_object=await get_redis(),
                           prefix="banks",
                           user_id=current_user.user_id)
    return bank


@router.get('/', response_model=Page[BankRead], status_code=200)
async def get_banks(page: PageNumber = 1, size: PageSize = 10, name: str = '',
                    session: AsyncSession = Depends(get_session),
                    current_user: ModulesUsers = Depends(get_finances)):
    redis_object = await get_redis()

    total_results = await session.execute(
        select(func.count())
        .where(Bank.user_id == current_user.user_id, Bank.name.like(f"%{name}%"))
    )
    total = total_results.scalar_one()

    cache_key = await make_cache_key("banks", current_user.user_id,
                                     page=page, size=size, name=name)
    cache = await safe_get(redis_object, cache_key)

    if cache:
        return {
            'items': json.loads(cache),
            'total': total,
            'pages': ceil(total / size) if total > 0 else 1,
            'page': page,
            'size': size,
        }

    result = await session.execute(
        select(Bank)
        .where(Bank.user_id == current_user.user_id, Bank.name.like(f"%{name}%"))
        .order_by(Bank.id.asc())
        .offset((page - 1) * size)
        .limit(size)
    )
    banks = result.scalars().all()
    pages = ceil(total / size) if total > 0 else 1
    logger.info(f"Всего было найдено {total} банков")

    await safe_set(redis_object, cache_key,
                   json.dumps([BankRead.model_validate(b).model_dump(mode="json") for b in banks]),
                   ex=3600)

    result = {
        'items': [BankRead.model_validate(b).model_dump(mode="json") for b in banks],
        'total': total,
        'pages': pages,
        'page': page,
        'size': size,
    }
    return result