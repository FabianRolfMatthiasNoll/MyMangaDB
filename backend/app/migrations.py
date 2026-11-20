"""Schema migrations.

The database schema is managed with Alembic. The migrations run when the
application starts, so a self-hosted installation upgrades itself.

Databases that were created before Alembic was introduced have no version
table. They already match the baseline migration, so they are stamped with
it and only the migrations that came after it are applied - that way an
existing collection is never dropped or rebuilt.
"""

import logging
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parent.parent
ALEMBIC_INI_PATH = BACKEND_DIR / "alembic.ini"
MIGRATIONS_DIR = BACKEND_DIR / "migrations"

# The revision that matches the schema as it looked before Alembic existed.
BASELINE_REVISION = "0001_baseline"


def build_alembic_config(url: str) -> Config:
    """Build the Alembic configuration for ``url``."""
    config = Config(str(ALEMBIC_INI_PATH))
    config.set_main_option("script_location", str(MIGRATIONS_DIR))
    config.set_main_option("sqlalchemy.url", url)
    # The application has already configured its logging - Alembic must not
    # replace it.
    config.set_main_option("configure_logger", "false")
    return config


def run_migrations(engine: Engine) -> None:
    """Bring the database schema up to date.

    Args:
        engine: The engine of the database to migrate.
    """
    config = build_alembic_config(str(engine.url))

    inspector = inspect(engine)
    has_version_table = inspector.has_table("alembic_version")
    has_app_tables = inspector.has_table("mangas")

    if has_app_tables and not has_version_table:
        # A database from before Alembic existed. Its schema already matches
        # the baseline, so record that and let the newer migrations run.
        logger.info(
            "Existing database without a version table - marking it as %s.",
            BASELINE_REVISION,
        )
        command.stamp(config, BASELINE_REVISION)

    command.upgrade(config, "head")
