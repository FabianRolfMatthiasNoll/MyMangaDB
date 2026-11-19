"""Tests for the schema migrations.

The important case is the upgrade of a database that was created before
Alembic existed: it must be stamped with the baseline and upgraded, not
rebuilt - otherwise an existing collection would be lost.
"""

import sqlite3

import pytest
from alembic.config import Config
from alembic.script import ScriptDirectory
from sqlalchemy import create_engine, inspect, text

from backend.app.migrations import ALEMBIC_INI_PATH, MIGRATIONS_DIR, run_migrations
from backend.app.models import Base


def head_revision() -> str:
    """The revision the migrations currently end at."""
    config = Config(str(ALEMBIC_INI_PATH))
    config.set_main_option("script_location", str(MIGRATIONS_DIR))
    return ScriptDirectory.from_config(config).get_current_head()


@pytest.fixture
def legacy_database(tmp_path):
    """A database with the pre-Alembic schema and no version table.

    This is what an existing installation looks like: the tables are there,
    but Alembic has never heard of them.
    """
    db_path = tmp_path / "legacy.db"
    connection = sqlite3.connect(db_path)
    connection.executescript(
        """
        CREATE TABLE authors (
            id INTEGER NOT NULL PRIMARY KEY,
            name VARCHAR,
            manga_count INTEGER
        );
        CREATE TABLE genres (
            id INTEGER NOT NULL PRIMARY KEY,
            name VARCHAR,
            manga_count INTEGER
        );
        CREATE TABLE lists (
            id INTEGER NOT NULL PRIMARY KEY,
            name VARCHAR
        );
        CREATE TABLE mangas (
            id INTEGER NOT NULL PRIMARY KEY,
            title VARCHAR,
            japanese_title VARCHAR,
            reading_status VARCHAR(5),
            overall_status VARCHAR(9),
            star_rating FLOAT,
            language VARCHAR,
            category VARCHAR(8),
            summary TEXT,
            cover_image VARCHAR
        );
        CREATE TABLE settings (
            id INTEGER NOT NULL PRIMARY KEY,
            key VARCHAR,
            value VARCHAR
        );
        CREATE TABLE sources (
            id INTEGER NOT NULL PRIMARY KEY,
            name VARCHAR,
            language VARCHAR
        );
        CREATE TABLE users (
            id INTEGER NOT NULL PRIMARY KEY,
            username VARCHAR,
            hashed_password VARCHAR,
            role VARCHAR(5)
        );
        CREATE TABLE volumes (
            id INTEGER NOT NULL PRIMARY KEY,
            volume_number VARCHAR,
            cover_image VARCHAR,
            manga_id INTEGER
        );
        CREATE TABLE manga_author (
            manga_id INTEGER NOT NULL,
            author_id INTEGER NOT NULL,
            PRIMARY KEY (manga_id, author_id)
        );
        CREATE TABLE manga_genre (
            manga_id INTEGER NOT NULL,
            genre_id INTEGER NOT NULL,
            PRIMARY KEY (manga_id, genre_id)
        );
        CREATE TABLE manga_list (
            manga_id INTEGER NOT NULL,
            list_id INTEGER NOT NULL,
            PRIMARY KEY (manga_id, list_id)
        );
        INSERT INTO mangas (id, title, category) VALUES (1, 'Existing Manga', 'manga');
        INSERT INTO authors (id, name, manga_count) VALUES (1, 'Someone', 1);
        """
    )
    connection.commit()
    connection.close()
    return db_path


@pytest.fixture
def engine_for(tmp_path):
    def _make(name: str):
        return create_engine(
            f"sqlite:///{tmp_path / name}",
            connect_args={"check_same_thread": False},
        )

    return _make


def test_a_fresh_database_gets_the_full_schema(engine_for):
    engine = engine_for("fresh.db")

    run_migrations(engine)

    inspector = inspect(engine)
    tables = set(inspector.get_table_names())
    assert {
        "authors",
        "genres",
        "lists",
        "mangas",
        "settings",
        "sources",
        "users",
        "volumes",
    } <= tables
    assert "alembic_version" in tables

    engine.dispose()


def test_an_existing_database_is_upgraded_and_keeps_its_data(
    legacy_database, engine_for
):
    engine = engine_for("legacy.db")

    run_migrations(engine)

    with engine.connect() as connection:
        titles = [
            row[0] for row in connection.execute(text("SELECT title FROM mangas"))
        ]
        authors = [
            row[0] for row in connection.execute(text("SELECT name FROM authors"))
        ]

    assert titles == ["Existing Manga"]
    assert authors == ["Someone"]

    engine.dispose()


def test_an_existing_database_is_stamped_with_the_baseline(legacy_database, engine_for):
    engine = engine_for("legacy.db")

    run_migrations(engine)

    with engine.connect() as connection:
        revision = connection.execute(
            text("SELECT version_num FROM alembic_version")
        ).scalar()

    # The legacy database was stamped with the baseline and then upgraded, so
    # it ends up at the current head.
    assert revision == head_revision()

    engine.dispose()


def test_running_the_migrations_twice_is_a_no_op(engine_for):
    engine = engine_for("twice.db")

    run_migrations(engine)
    run_migrations(engine)

    inspector = inspect(engine)
    assert "mangas" in inspector.get_table_names()

    engine.dispose()


def test_the_schema_matches_the_models(engine_for):
    """The migrations and the models must not drift apart."""
    engine = engine_for("match.db")

    run_migrations(engine)

    inspector = inspect(engine)
    model_tables = set(Base.metadata.tables)
    migrated_tables = {
        table
        for table in inspector.get_table_names()
        if not table.startswith("alembic")
    }

    assert model_tables == migrated_tables

    for table_name, table in Base.metadata.tables.items():
        migrated_columns = {
            column["name"] for column in inspector.get_columns(table_name)
        }
        model_columns = {column.name for column in table.columns}
        assert migrated_columns == model_columns, f"{table_name} differs"

    engine.dispose()
