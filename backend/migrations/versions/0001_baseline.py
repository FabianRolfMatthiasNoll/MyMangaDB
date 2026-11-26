"""Baseline schema.

The tables as they looked before the schema was managed with Alembic. A
database that was created before Alembic existed already matches this
revision and is stamped with it instead of running it - see
``backend/app/migrations.py``.

Revision ID: 0001_baseline
Revises:
Create Date: 2026-11-19 10:09:01.062125

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001_baseline"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the initial schema."""
    op.create_table(
        "authors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("authors", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_authors_id"), ["id"], unique=False)
        batch_op.create_index(batch_op.f("ix_authors_name"), ["name"], unique=False)

    op.create_table(
        "genres",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("genres", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_genres_id"), ["id"], unique=False)
        batch_op.create_index(batch_op.f("ix_genres_name"), ["name"], unique=False)

    op.create_table(
        "lists",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("lists", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_lists_id"), ["id"], unique=False)
        batch_op.create_index(batch_op.f("ix_lists_name"), ["name"], unique=False)

    op.create_table(
        "mangas",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("japanese_title", sa.String(), nullable=True),
        sa.Column(
            "reading_status",
            sa.Enum(
                "not_started",
                "in_progress",
                "completed",
                "on_hold",
                "dropped",
                name="readingstatus",
            ),
            nullable=True,
        ),
        sa.Column(
            "overall_status",
            sa.Enum(
                "ongoing", "completed", "hiatus", "cancelled", name="overallstatus"
            ),
            nullable=True,
        ),
        sa.Column("star_rating", sa.Float(), nullable=True),
        sa.Column("language", sa.String(), nullable=True),
        sa.Column(
            "category",
            sa.Enum("manga", "novel", "doujinshi", name="category"),
            nullable=True,
        ),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("cover_image", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("mangas", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_mangas_id"), ["id"], unique=False)
        batch_op.create_index(batch_op.f("ix_mangas_title"), ["title"], unique=False)

    op.create_table(
        "settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("key", sa.String(), nullable=True),
        sa.Column("value", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("settings", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_settings_id"), ["id"], unique=False)
        batch_op.create_index(batch_op.f("ix_settings_key"), ["key"], unique=True)

    op.create_table(
        "sources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("language", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("sources", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_sources_id"), ["id"], unique=False)
        batch_op.create_index(batch_op.f("ix_sources_name"), ["name"], unique=False)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(), nullable=True),
        sa.Column("hashed_password", sa.String(), nullable=True),
        sa.Column("role", sa.Enum("admin", "guest", name="role"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_users_id"), ["id"], unique=False)
        batch_op.create_index(
            batch_op.f("ix_users_username"), ["username"], unique=True
        )

    op.create_table(
        "manga_author",
        sa.Column("manga_id", sa.Integer(), nullable=False),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["author_id"],
            ["authors.id"],
        ),
        sa.ForeignKeyConstraint(
            ["manga_id"],
            ["mangas.id"],
        ),
        sa.PrimaryKeyConstraint("manga_id", "author_id"),
    )
    op.create_table(
        "manga_genre",
        sa.Column("manga_id", sa.Integer(), nullable=False),
        sa.Column("genre_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["genre_id"],
            ["genres.id"],
        ),
        sa.ForeignKeyConstraint(
            ["manga_id"],
            ["mangas.id"],
        ),
        sa.PrimaryKeyConstraint("manga_id", "genre_id"),
    )
    op.create_table(
        "manga_list",
        sa.Column("manga_id", sa.Integer(), nullable=False),
        sa.Column("list_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["list_id"],
            ["lists.id"],
        ),
        sa.ForeignKeyConstraint(
            ["manga_id"],
            ["mangas.id"],
        ),
        sa.PrimaryKeyConstraint("manga_id", "list_id"),
    )
    op.create_table(
        "volumes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("volume_number", sa.String(), nullable=True),
        sa.Column("cover_image", sa.String(), nullable=True),
        sa.Column("manga_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["manga_id"],
            ["mangas.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("volumes", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_volumes_id"), ["id"], unique=False)
        batch_op.create_index(
            batch_op.f("ix_volumes_volume_number"), ["volume_number"], unique=False
        )

    # ### end Alembic commands ###


def downgrade() -> None:
    """Revert the migration."""
    with op.batch_alter_table("volumes", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_volumes_volume_number"))
        batch_op.drop_index(batch_op.f("ix_volumes_id"))

    op.drop_table("volumes")
    op.drop_table("manga_list")
    op.drop_table("manga_genre")
    op.drop_table("manga_author")
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_users_username"))
        batch_op.drop_index(batch_op.f("ix_users_id"))

    op.drop_table("users")
    with op.batch_alter_table("sources", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_sources_name"))
        batch_op.drop_index(batch_op.f("ix_sources_id"))

    op.drop_table("sources")
    with op.batch_alter_table("settings", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_settings_key"))
        batch_op.drop_index(batch_op.f("ix_settings_id"))

    op.drop_table("settings")
    with op.batch_alter_table("mangas", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_mangas_title"))
        batch_op.drop_index(batch_op.f("ix_mangas_id"))

    op.drop_table("mangas")
    with op.batch_alter_table("lists", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_lists_name"))
        batch_op.drop_index(batch_op.f("ix_lists_id"))

    op.drop_table("lists")
    with op.batch_alter_table("genres", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_genres_name"))
        batch_op.drop_index(batch_op.f("ix_genres_id"))

    op.drop_table("genres")
    with op.batch_alter_table("authors", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_authors_name"))
        batch_op.drop_index(batch_op.f("ix_authors_id"))

    op.drop_table("authors")
    # ### end Alembic commands ###
