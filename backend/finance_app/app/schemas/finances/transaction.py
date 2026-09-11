from datetime import date
from decimal import Decimal
from fastapi import Query
from typing import Optional, List, Annotated

from pydantic import BaseModel, ConfigDict


class TransactionCreate(BaseModel):
    destination: str
    amount: Decimal
    cashback: Decimal
    replenishment: bool
    transaction_date: date
    category_id: int
    account_id: int


class TransactionChange(BaseModel):
    destination: Optional[str] = None
    amount: Optional[Decimal] = None
    cashback: Optional[Decimal] = None
    replenishment: Optional[bool] = None
    transaction_date: Optional[date] = None
    category_id: Optional[int] = None
    account_id: Optional[int] = None


class TransactionRead(BaseModel):
    id: int
    destination: str
    amount: Decimal
    cashback: Decimal
    replenishment: bool
    transaction_date: date
    category_id: int
    account_id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class TransactionFilter(BaseModel):
    destination: Optional[str] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None
    amount: Optional[Decimal] = None
    min_cashback: Optional[Decimal] = None
    max_cashback: Optional[Decimal] = None
    cashback: Optional[Decimal] = None
    transaction_date_from: Optional[date] = None
    transaction_date_to: Optional[date] = None
    transaction_date: Optional[date] = None
    category_id: Annotated[Optional[List[int]], Query()] = None
    account_id: Annotated[Optional[List[int]], Query()] = None
