from typing import Optional

from pydantic import BaseModel, ConfigDict

from backend.finance_app.app.db.models import LanguageLevels


class LanguageCreate(BaseModel):
    name: str
    code: Optional[str] = None
    current_level: LanguageLevels
    target_level: LanguageLevels


class LanguageChange(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    current_level: Optional[LanguageLevels] = None
    target_level: Optional[LanguageLevels] = None


class LanguageRead(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    current_level: LanguageLevels
    target_level: LanguageLevels
    user_id: int

    model_config = ConfigDict(from_attributes=True)
