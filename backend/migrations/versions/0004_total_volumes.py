"""Add the total number of volumes of a series.

Knowing how many volumes a series has in total turns "I am missing volumes 3
and 4" into "I am missing 24 of 27 volumes".

Revision ID: 0004_total_volumes
Revises: 0003_added_at_and_priority
Create Date: 2026-11-19 10:45:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0004_total_volumes"
down_revision: Union[str, None] = "0003_added_at_and_priority"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add the column. It stays empty - the total is not known for every series."""
    op.add_column(
        "mangas",
        sa.Column("total_volumes", sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    """Remove the column."""
    with op.batch_alter_table("mangas", schema=None) as batch_op:
        batch_op.drop_column("total_volumes")
