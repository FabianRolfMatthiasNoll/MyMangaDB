"""Alembic environment for MyMangaDB.

The database URL comes from the application configuration rather than from
``alembic.ini``, so migrations always run against the same database the app
uses - no matter whether it lives in the Docker volume, the config directory
or a local file.
"""

import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from backend.app.database import SQLALCHEMY_DATABASE_URL
from backend.app.models import Base

# The model metadata Alembic compares the database against.
target_metadata = Base.metadata

config = context.config

# ``alembic upgrade head`` from the command line configures the logging
# itself. When the application runs the migrations at startup it has already
# set up its own logging and must not have it replaced, so the app passes
# ``configure_logger = false``.
if config.get_main_option("configure_logger", "true").lower() == "true":
    if config.config_file_name is not None:
        fileConfig(config.config_file_name)


def get_url() -> str:
    """The database the migrations run against.

    A URL that was set explicitly - the application passes the engine it
    wants to migrate - always wins. Otherwise ``DATABASE_URL`` overrides the
    application configuration, which is handy for the command line and for
    tests.
    """
    configured = config.get_main_option("sqlalchemy.url", None)
    if configured:
        return configured
    return os.getenv("DATABASE_URL") or SQLALCHEMY_DATABASE_URL


def run_migrations_offline() -> None:
    """Run the migrations without a database connection (``--sql`` mode)."""
    context.configure(
        url=get_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        # SQLite cannot ALTER most things in place - batch mode copies the
        # table instead.
        render_as_batch=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run the migrations against a live database."""
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = get_url()

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
