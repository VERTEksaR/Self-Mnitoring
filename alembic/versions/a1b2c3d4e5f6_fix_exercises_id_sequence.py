"""fix exercises id sequence

Revision ID: a1b2c3d4e5f6
Revises: 88d4dd86ba77
Create Date: 2026-06-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '88d4dd86ba77'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE SEQUENCE IF NOT EXISTS exercises_id_seq")
    op.execute(
        "SELECT setval('exercises_id_seq', COALESCE((SELECT MAX(id) FROM exercises), 0) + 1)"
    )
    op.execute(
        "ALTER TABLE exercises ALTER COLUMN id SET DEFAULT nextval('exercises_id_seq')"
    )


def downgrade() -> None:
    op.execute("ALTER TABLE exercises ALTER COLUMN id DROP DEFAULT")
    op.execute("DROP SEQUENCE IF EXISTS exercises_id_seq")
