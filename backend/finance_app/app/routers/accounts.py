import logging
import json
from math import ceil
from datetime import date
from typing import List

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from backend.finance_app.app.db.redis import get_redis
from backend.finance_app.app.dependencies.auth import get_current_user
from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.db.models import Account, User, Transaction
from backend.finance_app.app.schemas.account import AccountRead, AccountCreate, AccountBalancesRead
from backend.finance_app.app.schemas.common import Page

router = APIRouter()

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s - %(name)s - %(asctime)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@router.get("/balances", response_model=List[AccountBalancesRead], status_code=200)
async def get_balances_accounts(
    date_from: date = Query(...),
    date_to: date = Query(...),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result_data = await session.execute(
        select(
            Account.id.label('account_id'),
            Account.name.label('account_name'),
            func.coalesce(func.sum(case(
                (Transaction.replenishment.is_(True), Transaction.amount),
                else_=0
            )), 0).label('income'),
            func.coalesce(func.sum(case(
                (Transaction.replenishment.is_(False), Transaction.amount),
                else_=0
            )), 0).label('expense'),
            func.coalesce(func.sum(case(
                (Transaction.replenishment.is_(True), Transaction.amount),
                else_=-Transaction.amount
            )), 0).label('balance'),
        )
        .join(Transaction, Account.id == Transaction.account_id)
        .where(
            Account.user_id == current_user.id,
            Transaction.user_id == current_user.id,
            Transaction.transaction_date.between(date_from, date_to),
        )
        .group_by(Account.id, Account.name)
        .order_by(Account.name)
    )
    rows = result_data.fetchall()
    logger.info(f"Балансы по {len(rows)} счетам получены для пользователя {current_user.id}")
    return rows


@router.get("/{account_id}", response_model=AccountRead, status_code=200)
async def get_account(account_id: int, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    result = await session.execute(
        select(Account).where((Account.id == account_id) & (Account.user_id == current_user.id))
    )
    account = result.scalar_one_or_none()

    if not account:
        logger.error(f"Счет с id {account_id} не был найден")
        raise HTTPException(status_code=404, detail=f"Счет с id {account_id} не был найден")

    logger.info(f"Счет с id {account_id} был найден")
    return account


@router.delete("/{account_id}", status_code=204)
async def delete_account(account_id: int, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    account = await session.get(Account, account_id)

    if not account:
        logger.error(f"Счет с id {account_id} не был найден")
        raise HTTPException(status_code=404, detail=f"Счет с id {account_id} не был найден")

    await session.delete(account)
    await session.commit()
    logger.info(f"С чет с id {account_id} был удален")
    return None


@router.post("/", response_model=AccountRead, status_code=201)
async def create_account(account_data: AccountCreate, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    account = Account(**account_data.model_dump(), user_id=current_user.id)
    session.add(account)
    await session.commit()
    logger.info(f"Счет с id {account.id} был создан")
    return account


@router.get("/", response_model=Page[AccountRead], status_code=200)
async def get_accounts(page: int = 1, size: int = 10, name: str = '', session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    redis_object = await get_redis()

    total_result = await session.execute(
        select(func.count()).where((Account.name.like(f"%{name}%")) & (Account.user_id == current_user.id))
    )
    total = total_result.scalar_one()

    cache_key = f'accounts_{current_user.id}_{page}_{size}_{total}'
    cache = await redis_object.get(cache_key)

    if cache:
        return json.loads(cache)

    result = await session.execute(
        select(Account).where((Account.name.like(f"%{name}%")) & (Account.user_id == current_user.id))
    )
    accounts = result.scalars().all()
    pages = ceil(total / size) if total > 0 else 1
    logger.info(f"Всего было найдено {total} счетов")
    result = {
        'items': [AccountRead.model_validate(a).model_dump(mode="json") for a in accounts],
        'total': total,
        'pages': pages,
        'page': page,
        'size': size,
    }
    await redis_object.set(cache_key, json.dumps(result), ex=3600)
    return result
