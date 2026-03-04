from math import ceil

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from backend.finance_app.app.dependencies.auth import get_current_user
from backend.finance_app.app.db.session import get_session
from backend.finance_app.app.db.models import Transaction, User
from backend.finance_app.app.schemas.transaction import TransactionRead, TransactionCreate, TransactionFilter
from backend.finance_app.app.schemas.common import Page

router = APIRouter()


@router.get("/{transaction_id}", response_model=TransactionRead, status_code=200)
async def get_transaction(transaction_id: int, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    result = await session.execute(
        select(Transaction).where((Transaction.id == transaction_id) & (Transaction.user_id == current_user.id))
    )
    transaction = result.scalar_one_or_none()

    if not transaction:
        raise HTTPException(status_code=404, detail=f"Транзакций с id {transaction_id} не была найдена")

    return transaction


@router.delete("/{transaction_id}", status_code=204)
async def delete_transaction(transaction_id: int, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    transaction = await session.get(Transaction, transaction_id)

    if not transaction:
        raise HTTPException(status_code=404, detail=f"Транзакций с id {transaction_id} не была найдена")

    await session.delete(transaction)
    await session.commit()
    return None


@router.post('/', response_model=TransactionRead, status_code=201)
async def create_transaction(transaction_data: TransactionCreate, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    transaction = Transaction(**transaction_data.model_dump())
    session.add(transaction)
    await session.commit()
    return transaction


@router.get('/', response_model=Page[TransactionRead], status_code=200)
async def get_transactions(page: int = 1, size: int = 10, filters: TransactionFilter = Depends(), session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    conditions = [Transaction.user_id == current_user.id]

    if filters.destination:
        conditions.append(Transaction.destination.like(f'%{filters.destination}%'))

    if filters.min_amount:
        conditions.append(Transaction.amount >= filters.min_amount)

    if filters.max_amount:
        conditions.append(Transaction.amount <= filters.max_amount)

    if filters.amount:
        conditions.append(Transaction.amount == filters.amount)

    if filters.min_cashback:
        conditions.append(Transaction.cashback >= filters.min_cashback)

    if filters.max_cashback:
        conditions.append(Transaction.cashback <= filters.max_cashback)

    if filters.cashback:
        conditions.append(Transaction.cashback == filters.cashback)

    if filters.category_id:
        conditions.append(Transaction.category_id == filters.category_id)

    if filters.account_id:
        conditions.append(Transaction.account_id == filters.account_id)

    if filters.transaction_date_from:
        conditions.append(Transaction.transaction_date >= filters.transaction_date_from)

    if filters.transaction_date_to:
        conditions.append(Transaction.transaction_date <= filters.transaction_date_to)

    if filters.transaction_date:
        conditions.append(Transaction.transaction_date == filters.transaction_date)

    total_result = await session.execute(
        select(func.count()).where(*conditions)
    )
    total = total_result.scalar_one()

    result = await session.execute(
        select(Transaction).where(*conditions)
        .offset((page - 1) * size)
        .limit(size)
    )
    transactions = result.scalars().all()
    pages = ceil(total / size) if total > 0 else 1
    return {
        'items': transactions,
        'total': total,
        'pages': pages,
        'page': page,
        'size': size,
    }