"""Add the added-at date and the priority flag.

The wishlist needs to know when a title was added so it can show the most
recent wishes, and whether a title is prioritised so an urgent want can be
pulled out of the noise.

Revision ID: 0003_added_at_and_priority
Revises: 0002_ownership_status
Create Date: 2026-11-19 10:35:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0003_added_at_and_priority"
down_revision: Union[str, None] = "0002_ownership_status"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add the columns.

    Existing rows get the moment of the migration as their added-at date and
    are not prioritised.

    The table is recreated rather than altered in place: SQLite refuses to
    add a column with a non-constant default such as ``CURRENT_TIMESTAMP``.
    """
    with op.batch_alter_table("mangas", schema=None, recreate="always") as batch_op:
        batch_op.add_column(
            sa.Column(
                "added_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.func.now(),
            ),
        )
        batch_op.add_column(
            sa.Column(
                "priority",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            ),
        )


def downgrade() -> None:
    """Remove the columns."""
    with op.batch_alter_table("mangas", schema=None) as batch_op:
        batch_op.drop_column("priority")
        batch_op.drop_column("added_at")
