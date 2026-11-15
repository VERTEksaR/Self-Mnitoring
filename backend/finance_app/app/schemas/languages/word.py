import re
from datetime import date, datetime
from typing import Optional, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from backend.finance_app.app.db.models import PartOfSpeech
from backend.finance_app.app.schemas.common.common import forbid_null
from backend.finance_app.app.schemas.languages.tag import TagRead


class WordCreate(BaseModel):
    word: str
    translation: str
    transcription: Optional[str] = None
    part_of_speech: Optional[PartOfSpeech] = None
    example: Optional[str] = None
    note: Optional[str] = None
    tag_ids: list[int] = []


class WordChange(BaseModel):
    word: Optional[str] = None
    translation: Optional[str] = None
    transcription: Optional[str] = None
    part_of_speech: Optional[PartOfSpeech] = None
    example: Optional[str] = None
    note: Optional[str] = None
    tag_ids: list[int] = []

    check_not_null = forbid_null("word", "translation", "tag_ids")


class WordRead(BaseModel):
    id: int
    word: str
    translation: str
    transcription: Optional[str] = None
    part_of_speech: Optional[PartOfSpeech] = None
    example: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime
    box: int
    next_review_date: Optional[date] = None
    language_id: int
    user_id: int
    tags: list[TagRead] = []

    model_config = ConfigDict(from_attributes=True)


def js_to_python(js_index, js_text):
    if js_index < 0:
        raise ValueError("js_index must be >= 0")

    utf16_bytes = js_text.encode("utf-16-le")
    bytes_pos = js_index * 2

    if bytes_pos > len(utf16_bytes):
        raise ValueError("Позиция выходит за пределы предложения")

    try:
        py_sub = utf16_bytes[: bytes_pos].decode("utf-16-le")
    except UnicodeDecodeError:
        raise ValueError("Позиция попадает внутрь символа UTF-16")

    return len(py_sub)


class TranslateWordInput(BaseModel):
    word: str = Field(min_length=1, max_length=100)
    sentence: str = Field(min_length=1, max_length=2000)
    selection_start: int = Field(ge=0)
    selection_end: int = Field(ge=1)

    @model_validator(mode='after')
    def validate_selection(self):
        if self.selection_start >= self.selection_end:
            raise ValueError(
                "Начало выделения должно быть меньше конца"
            )

        if len(self.word.strip()) == 0 or len(self.sentence.strip()) == 0:
            raise ValueError(
                "Предложение и слово не выбраны"
            )

        pos_start = js_to_python(self.selection_start, self.sentence)
        pos_end = js_to_python(self.selection_end, self.sentence)

        if self.sentence[pos_start:pos_end] != self.word:
            raise ValueError(
                "Слово после преобразования не соответствует тому, что указано в предложении"
            )

        pattern = r"[\w’'-]"

        if pos_start > 0:
            if re.fullmatch(pattern, self.sentence[pos_start - 1]):
                raise ValueError("Выделение начинается внутри слова")

        if pos_end < len(self.sentence):
            if re.fullmatch(pattern, self.sentence[pos_end]):
                raise ValueError("Выделение заканчивается внутри слова")

        return self




class TranslationWordOutput(BaseModel):
    word: str | None = None
    translation: str | None = None
    part_of_speech: Optional[PartOfSpeech] = None
    example: str | None = None
    error: Literal["insufficient_context", "unrecognized_word", "wrong_language"] | None = None


class WordTranslationAIResult(BaseModel):
    error: Literal["insufficient_context", "unrecognized_word", "wrong_language"] | None
    word: str | None
    translation: str | None
    part_of_speech: PartOfSpeech | None

    @model_validator(mode='after')
    def validate_result(self):
        if self.error is not None:
            if any(value is not None for value in (self.word, self.translation, self.part_of_speech)):
                raise ValueError("При ошибке поля перевода должны быть null")
        elif not self.word or not self.word.strip() or not self.translation or not self.translation.strip():
            raise ValueError("Успешный перевод должен содержать слово и перевод")
        return self
