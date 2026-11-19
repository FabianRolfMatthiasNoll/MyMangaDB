"""Regression tests for the blocking work in the async endpoints.

The export, the database import and the MyAnimeList import all do
filesystem and network I/O. When they run on the event loop they block
every other request for the duration - a large MyAnimeList import issues
hundreds of HTTP calls and would freeze the whole server.

These tests assert that the blocking parts run on a worker thread instead.
"""

import inspect
import io
import os
import sqlite3
import threading
import zipfile
from contextlib import contextmanager
from unittest.mock import patch

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool

os.environ.setdefault("DOCKER_MODE", "false")
os.environ.setdefault("API_TOKEN", "test-token")

from backend.app.api.deps import (  # noqa: E402
    get_current_active_superuser,
    get_current_user,
)
from backend.app.api.v1.endpoints import database as database_endpoints  # noqa: E402
from backend.app.importers.mal import MALImporter  # noqa: E402
from backend.app.main import app  # noqa: E402
from backend.app.models import Base, Role, User  # noqa: E402
from backend.app.schemas import ImportResponse  # noqa: E402


@pytest.fixture
def fake_engine():
    eng = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=eng)
    with patch("backend.app.api.v1.endpoints.database.engine", eng):
        yield eng
    Base.metadata.drop_all(bind=eng)


@pytest.fixture
def tmp_paths(tmp_path):
    db_path = tmp_path / "MyMangaDB.db"
    img_dir = tmp_path / "images"
    img_dir.mkdir()
    with patch(
        "backend.app.api.v1.endpoints.database.DATABASE_PATH", str(db_path)
    ), patch("backend.app.api.v1.endpoints.database.IMAGE_PATH", str(img_dir)):
        yield {"db_path": db_path, "image_path": img_dir}


def _admin_dep():
    def _dep():
        return User(id=1, username="admin", role=Role.admin)

    return _dep


def _client():
    app.dependency_overrides[get_current_user] = _admin_dep()
    app.dependency_overrides[get_current_active_superuser] = _admin_dep()
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


@contextmanager
def _named_db_file():
    import tempfile

    handle = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    handle.close()
    try:
        yield handle.name
    finally:
        os.unlink(handle.name)


def _build_db_zip() -> bytes:
    with _named_db_file() as db_path:
        con = sqlite3.connect(db_path)
        con.execute("CREATE TABLE users (id INTEGER PRIMARY KEY)")
        con.commit()
        con.close()
        with open(db_path, "rb") as handle:
            db_bytes = handle.read()

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr("MyMangaDB.db", db_bytes)
    return buffer.getvalue()


def test_export_endpoint_is_not_a_coroutine():
    """A sync endpoint is run in FastAPI's threadpool."""
    assert not inspect.iscoroutinefunction(database_endpoints.export_database)


@pytest.mark.asyncio
async def test_import_runs_the_extraction_off_the_event_loop(
    fake_engine, tmp_paths, monkeypatch
):
    event_loop_thread = threading.get_ident()
    seen = {}

    def fake_extract(temp_dir, temp_zip):
        seen["thread"] = threading.get_ident()

    monkeypatch.setattr(database_endpoints, "_extract_import_archive", fake_extract)

    async with _client() as client:
        response = await client.post(
            "/api/v1/database/import",
            files={"file": ("db.zip", _build_db_zip(), "application/zip")},
        )

    assert response.status_code == 200, response.text
    assert seen["thread"] != event_loop_thread


@pytest.mark.asyncio
async def test_mal_import_runs_off_the_event_loop(monkeypatch):
    event_loop_thread = threading.get_ident()
    seen = {}

    def fake_work(self, content):
        seen["thread"] = threading.get_ident()
        return ImportResponse(total=0, imported=0, skipped=0, failed=0, logs=[])

    monkeypatch.setattr(MALImporter, "_import_content", fake_work)

    async with _client() as client:
        response = await client.post(
            "/api/v1/import/mal",
            files={"file": ("anime-list.xml", b"<myanimelist/>", "text/xml")},
        )

    assert response.status_code == 200, response.text
    assert seen["thread"] != event_loop_thread
