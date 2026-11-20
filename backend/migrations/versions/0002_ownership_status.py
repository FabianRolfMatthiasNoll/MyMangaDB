"""Add the ownership status.

Manga get a column that says whether they are owned, wanted or on the way -
independent of how far they have been read.

Revision ID: 0002_ownership_status
Revises: 0001_baseline
Create Date: 2026-11-19 10:20:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002_ownership_status"
down_revision: Union[str, None] = "0001_baseline"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add the ownership status column.

    Existing rows become ``owned`` - nobody's shelf shrinks on an upgrade.
    """
    op.add_column(
        "mangas",
        sa.Column(
            "ownership_status",
            sa.Enum("owned", "wishlist", "ordered", name="ownershipstatus"),
            nullable=False,
            server_default="owned",
        ),
    )


def downgrade() -> None:
    """Remove the ownership status column."""
    with op.batch_alter_table("mangas", schema=None) as batch_op:
        batch_op.drop_column("ownership_status")
