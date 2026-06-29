from pydantic import BaseModel, ConfigDict
from decimal import Decimal


class AccountCreate(BaseModel):
    name: str


class AccountRead(BaseModel):
    id: int
    name: str
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class AccountBalancesRead(BaseModel):
    account_id: int
    account_name: str
    income: Decimal
    expense: Decimal
    balance: Decimal

    model_config = ConfigDict(from_attributes=True)
