from typing import Optional

from pydantic import BaseModel, ConfigDict, model_validator


class BankCreate(BaseModel):
    name: str

    @model_validator(mode="after")
    def validate_name(self):
        if len(self.name.strip()) == 0:
            raise ValueError(
                "Название банка не введено"
            )

        self.name = self.name.strip()

        return self


class BankRead(BaseModel):
    id: int
    name: str
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class BankChange(BaseModel):
    name: str | None = None

    @model_validator(mode="after")
    def validate_name(self):
        if 'name' not in self.model_fields_set:
            return self

        if self.name is None:
            raise ValueError("Название банка не введено")

        if len(self.name.strip()) == 0:
            raise ValueError(
                "Название банка не введено"
            )

        self.name = self.name.strip()

        return self
