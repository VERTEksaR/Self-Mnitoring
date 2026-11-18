from pydantic import BaseModel

from backend.finance_app.app.schemas.languages.word import WordRead


class ReviewAnswer(BaseModel):
    remembered: bool


class ReviewBatch(BaseModel):
    items: list[WordRead]
    total: int


class ChoiceItem(BaseModel):
    id: int
    word: str
    translation: str