from math import ceil

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from backend.finance_app.app.dependencies.auth import get_current_user
from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.db.models import Account, User
from backend.finance_app.app.schemas.account import AccountRead, AccountCreate
from backend.finance_app.app.schemas.common import Page

router = APIRouter()


@router.get("/{account_id}", response_model=AccountRead, status_code=200)
async def get_account(account_id: int, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    account = await session.execute(
        select(Account).where((Account.id == account_id) & (Account.user_id == current_user.id))
    )

    if not account:
        raise HTTPException(status_code=404, detail=f"Счет с id {account_id} не был найден")

    return account


@router.delete("/{account_id}", status_code=204)
async def delete_account(account_id: int, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    account = await session.get(Account, account_id)

    if not account:
        raise HTTPException(status_code=404, detail=f"Счет с id {account_id} не был найден")

    await session.delete(account)
    await session.commit()
    return None


@router.post("/", response_model=AccountRead, status_code=201)
async def create_account(account_data: AccountCreate, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    account = Account(**account_data.model_dump())
    session.add(account)
    await session.commit()
    return account


@router.get("/", response_model=Page[AccountRead], status_code=200)
async def get_accounts(page: int = 1, size: int = 10, name: str = '', session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    total_result = await session.execute(
        select(func.count()).where((Account.name.like(f"%{name}%")) & (Account.user_id == current_user.id))
    )
    total = total_result.scalar_one()

    result = await session.execute(
        select(Account).where(Account.name.like(f"%{name}%"))
    )
    accounts = result.scalars().all()
    pages = ceil(total / size) if total > 0 else 1
    return {
        'items': accounts,
        'total': total,
        'pages': pages,
        'page': page,
        'size': size,
    }
