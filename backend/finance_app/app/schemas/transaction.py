from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TransactionCreate(BaseModel):
    destination: str
    amount: float
    cashback: float
    replenishment: bool
    transaction_date: date
    category_id: int
    account_id: int
    user_id: int


class TransactionRead(BaseModel):
    id: int
    destination: str
    amount: float
    cashback: float
    replenishment: bool
    transaction_date: date
    category_id: int
    account_id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class TransactionFilter(BaseModel):
    destination: Optional[str] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    amount: Optional[float] = None
    min_cashback: Optional[float] = None
    max_cashback: Optional[float] = None
    cashback: Optional[float] = None
    transaction_date_from: Optional[date] = None
    transaction_date_to: Optional[date] = None
    transaction_date: Optional[date] = None
    category_id: Optional[int] = None
    account_id: Optional[int] = None
