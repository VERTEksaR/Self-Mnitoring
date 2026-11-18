from typing import Optional

from pydantic import BaseModel, ConfigDict
from decimal import Decimal

from backend.finance_app.app.db.models import AccountType
from backend.finance_app.app.schemas.common.common import forbid_null


class AccountCreate(BaseModel):
    name: str
    account_type: AccountType = AccountType.CHECKING
    goal_amount: Optional[Decimal] = None


class AccountRead(BaseModel):
    id: int
    name: str
    user_id: int
    account_type: AccountType
    goal_amount: Optional[Decimal] = None

    model_config = ConfigDict(from_attributes=True)


class AccountChange(BaseModel):
    name: Optional[str] = None
    account_type: Optional[AccountType] = None
    goal_amount: Optional[Decimal] = None

    check_not_null = forbid_null("name", "account_type")


class AccountBalancesRead(BaseModel):
    account_id: int
    account_name: str
    income: Decimal
    expense: Decimal
    balance: Decimal

    model_config = ConfigDict(from_attributes=True)
