from typing import Annotated, Generic, TypeVar, List

from fastapi import Query
from pydantic import field_validator
from pydantic.generics import GenericModel

T = TypeVar('T')

# Параметры пагинации: page=0 или size=0 давали 500 (отрицательный offset, деление на ноль).
# Верхний предел с запасом: фронт запрашивает до 500 записей (FinancePage, WorkoutsPage).
PageNumber = Annotated[int, Query(ge=1)]
PageSize = Annotated[int, Query(ge=1, le=1000)]


class Page(GenericModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int


def forbid_null(*fields: str):
    """Для Change-схем: поле можно не передавать, но явный null в NOT NULL-колонке давал 500 от БД."""
    def check(value):
        if value is None:
            raise ValueError("Поле не может быть null")
        return value

    return field_validator(*fields)(check)
