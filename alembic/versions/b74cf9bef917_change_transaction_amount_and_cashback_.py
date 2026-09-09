"""change transaction amount and cashback to numeric

Revision ID: b74cf9bef917
Revises: 93fff30bd4c4
Create Date: 2026-09-09 14:22:48.666655

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b74cf9bef917'
down_revision: Union[str, Sequence[str], None] = '93fff30bd4c4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        'transactions', 'amount',
        existing_type=sa.Float(),
        type_=sa.Numeric(precision=12, scale=2),
        existing_nullable=False,
        postgresql_using='amount::numeric(12,2)',
    )
    op.alter_column(
        'transactions', 'cashback',
        existing_type=sa.Float(),
        type_=sa.Numeric(precision=12, scale=2),
        existing_nullable=False,
        postgresql_using='cashback::numeric(12,2)',
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        'transactions', 'cashback',
        existing_type=sa.Numeric(precision=12, scale=2),
        type_=sa.Float(),
        existing_nullable=False,
        postgresql_using='cashback::double precision',
    )
    op.alter_column(
        'transactions', 'amount',
        existing_type=sa.Numeric(precision=12, scale=2),
        type_=sa.Float(),
        existing_nullable=False,
        postgresql_using='amount::double precision',
    )
