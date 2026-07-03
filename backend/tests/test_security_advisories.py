"""Regression tests for the three security advisories reported against
``backend/app/api/v1/endpoints/database.py`` and ``image.py``.

Each test corresponds to a concrete attack described in ``advisory.txt``:

* Report 1 - unauthenticated ``/database/import`` allowing arbitrary DB
  replacement (also blocks unauthenticated zip-slip and oversized uploads).
* Report 2 - unauthenticated ``/images/manga/save`` allowing arbitrary
  filesystem writes via path traversal in the ``filename`` form field.
* Report 3 - unauthenticated ``/database/export`` leaking password hashes.

The tests exercise the FastAPI app via ``httpx.AsyncClient`` against
ASGITransport, which is the same approach used elsewhere in this suite.
"""

import io
import os
import sqlite3
import zipfile
from unittest.mock import patch

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Force non-Docker mode so the settings module picks a stable IMAGE_SAVE_PATH
os.environ.setdefault("DOCKER_MODE", "false")
os.environ.setdefault("API_TOKEN", "test-token")

from backend.app.api.deps import (  # noqa: E402
    get_current_active_superuser,
    get_current_user,
)
from backend.app.database import get_db  # noqa: E402
from backend.app.main import app  # noqa: E402
from backend.app.models import Base, Role, User  # noqa: E402

# ---------------------------------------------------------------------------
# Per-test database: use a fresh in-memory SQLite engine for each test so
# the production engine (which is what ``database.py`` closes + re-opens)
# stays under our control.
# ---------------------------------------------------------------------------


def _build_engine():
    eng = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=eng)
    return eng


@pytest.fixture
def fake_engine():
    """Yield a per-test in-memory engine and patch the global ``engine``
    used by the database export/import endpoints to point at it."""
    eng = _build_engine()
    with patch("backend.app.api.v1.endpoints.database.engine", eng):
        yield eng
    Base.metadata.drop_all(bind=eng)


@pytest.fixture
def tmp_paths(tmp_path):
    """Yield patched DATABASE_PATH and IMAGE_PATH under a temp dir so the
    export/import endpoints don't touch real on-disk state."""
    db_path = tmp_path / "MyMangaDB.db"
    img_dir = tmp_path / "images"
    img_dir.mkdir()
    with patch(
        "backend.app.api.v1.endpoints.database.DATABASE_PATH", str(db_path)
    ), patch("backend.app.api.v1.endpoints.database.IMAGE_PATH", str(img_dir)), patch(
        "backend.app.settings.IMAGE_SAVE_PATH", str(img_dir)
    ), patch(
        # ``image.py`` does ``from backend.app.settings import IMAGE_SAVE_PATH``
        # so we also need to rebind the symbol where it is actually used.
        "backend.app.api.v1.endpoints.image.IMAGE_SAVE_PATH",
        str(img_dir),
    ), patch(
        "backend.config.DATABASE_PATH", str(db_path)
    ), patch(
        "backend.config.IMAGE_PATH", str(img_dir)
    ):
        yield {"db_path": db_path, "image_path": img_dir}


# ---------------------------------------------------------------------------
# Auth fixtures: build the client with explicit user roles so we can
# exercise 401 (no token), 403 (non-admin), and 200 (admin) paths.
# ---------------------------------------------------------------------------


def _unauthenticated_dep():
    """Stand-in for ``get_current_user`` that always rejects - simulates a
    request that arrives without a valid bearer token."""
    from fastapi import HTTPException, status

    def _dep():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    return _dep


def _non_admin_dep():
    """Stand-in for ``get_current_user`` that returns a guest user."""

    def _dep():
        return User(id=2, username="guest", role=Role.guest)

    return _dep


def _admin_dep():
    """Stand-in for ``get_current_user`` that returns an admin user."""

    def _dep():
        return User(id=1, username="admin", role=Role.admin)

    return _dep


def _client_with_auth(auth_overrides, db_session=None):
    """Build an AsyncClient with the given auth dependency overrides.

    ``db_session`` may be passed to wire up the ``get_db`` override too.
    """
    overrides = dict(auth_overrides)
    if db_session is not None:
        overrides[get_db] = lambda: db_session
    app.dependency_overrides.update(overrides)
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.fixture(autouse=True)
def _clear_overrides():
    """Make sure no dependency overrides leak between tests."""
    yield
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Report 3: /database/export must require admin auth.
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_export_database_rejects_unauthenticated(fake_engine, tmp_paths):
    """Report 3: anonymous request must be rejected with 401."""
    async with _client_with_auth(
        {
            get_current_user: _unauthenticated_dep(),
            get_current_active_superuser: _unauthenticated_dep(),
        }
    ) as client:
        response = await client.get("/api/v1/database/export")
    assert response.status_code == 401, response.text


@pytest.mark.asyncio
async def test_export_database_rejects_non_admin(fake_engine, tmp_paths):
    """A logged-in non-admin user must not be able to dump the DB.

    We only override ``get_current_user`` (returning a guest) and let the
    real ``get_current_active_superuser`` function run - that way the
    function-level role check fires and returns 403, not 401.
    """
    async with _client_with_auth(
        {
            get_current_user: _non_admin_dep(),
        }
    ) as client:
        response = await client.get("/api/v1/database/export")
    assert response.status_code == 403, response.text


@pytest.mark.asyncio
async def test_export_database_allows_admin(fake_engine, tmp_paths):
    """An admin user can successfully export the (empty) database."""
    # Populate the empty in-memory engine with a single fake user so the
    # export actually has content (mirrors the seeded schema).
    SessionLocal = sessionmaker(bind=fake_engine)
    db = SessionLocal()
    try:
        db.add(User(id=1, username="admin", hashed_password="x", role=Role.admin))
        db.commit()
    finally:
        db.close()

    async with _client_with_auth(
        {
            get_current_user: _admin_dep(),
            get_current_active_superuser: _admin_dep(),
        }
    ) as client:
        response = await client.get("/api/v1/database/export")
    assert response.status_code == 200, response.text
    assert response.headers["content-type"] == "application/zip"


# ---------------------------------------------------------------------------
# Report 1: /database/import must require admin auth + reject bad archives.
# ---------------------------------------------------------------------------


def _build_evil_db_zip(name: str = "MyMangaDB.db") -> bytes:
    """Build a ZIP archive that contains a SQLite users table with an
    attacker-controlled admin row. Mirrors the PoC in ``advisory.txt``."""
    # Python 3.14+ rejects BytesIO as the connect target, so build the
    # database in-memory and dump it through a temp file.
    import tempfile

    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
        tmp_path = tmp.name
    try:
        con = sqlite3.connect(tmp_path)
        cur = con.cursor()
        cur.execute(
            "CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, "
            "hashed_password TEXT, role TEXT)"
        )
        cur.execute("INSERT INTO users VALUES (1,'hacker','$2b$12$fakehash','admin')")
        con.commit()
        con.close()
        with open(tmp_path, "rb") as f:
            db_bytes = f.read()
    finally:
        os.unlink(tmp_path)

    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, "w") as zf:
        zf.writestr(name, db_bytes)
    return zip_buf.getvalue()


@pytest.mark.asyncio
async def test_import_database_rejects_unauthenticated(fake_engine, tmp_paths):
    """Report 1: anonymous request must be rejected with 401."""
    payload = _build_evil_db_zip()
    async with _client_with_auth(
        {
            get_current_user: _unauthenticated_dep(),
            get_current_active_superuser: _unauthenticated_dep(),
        }
    ) as client:
        response = await client.post(
            "/api/v1/database/import",
            files={"file": ("evil.zip", payload, "application/zip")},
        )
    assert response.status_code == 401, response.text


@pytest.mark.asyncio
async def test_import_database_rejects_non_admin(fake_engine, tmp_paths):
    """A logged-in non-admin must not be able to replace the DB.

    Only ``get_current_user`` is overridden so the real
    ``get_current_active_superuser`` role check fires and returns 403.
    """
    payload = _build_evil_db_zip()
    async with _client_with_auth(
        {
            get_current_user: _non_admin_dep(),
        }
    ) as client:
        response = await client.post(
            "/api/v1/database/import",
            files={"file": ("evil.zip", payload, "application/zip")},
        )
    assert response.status_code == 403, response.text


@pytest.mark.asyncio
async def test_import_database_rejects_non_zip(fake_engine, tmp_paths):
    """Garbage that is not a ZIP archive must be rejected with 400."""
    async with _client_with_auth(
        {
            get_current_user: _admin_dep(),
            get_current_active_superuser: _admin_dep(),
        }
    ) as client:
        response = await client.post(
            "/api/v1/database/import",
            files={"file": ("evil.zip", b"not-a-real-zip", "application/zip")},
        )
    assert response.status_code == 400, response.text


@pytest.mark.asyncio
async def test_import_database_rejects_zip_without_db(fake_engine, tmp_paths):
    """A ZIP without any ``.db`` member must be rejected with 400."""
    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, "w") as zf:
        zf.writestr("hello.txt", b"hi")
    async with _client_with_auth(
        {
            get_current_user: _admin_dep(),
            get_current_active_superuser: _admin_dep(),
        }
    ) as client:
        response = await client.post(
            "/api/v1/database/import",
            files={"file": ("no-db.zip", zip_buf.getvalue(), "application/zip")},
        )
    assert response.status_code == 400, response.text


@pytest.mark.asyncio
async def test_import_database_rejects_zip_slip(fake_engine, tmp_paths):
    """A ZIP with a member whose name resolves outside the extract dir
    (zip-slip) must be rejected with 400 and must not write anything."""
    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, "w") as zf:
        # Path-traversal member name. ``extractall`` would happily write
        # this outside the temp dir; the hardened handler refuses it.
        zf.writestr("../../MyMangaDB.db", b"garbage")

    # Make sure the destination DB file does NOT exist before the request.
    db_path = tmp_paths["db_path"]
    assert not db_path.exists()

    async with _client_with_auth(
        {
            get_current_user: _admin_dep(),
            get_current_active_superuser: _admin_dep(),
        }
    ) as client:
        response = await client.post(
            "/api/v1/database/import",
            files={"file": ("slip.zip", zip_buf.getvalue(), "application/zip")},
        )
    assert response.status_code == 400, response.text
    # Confirm the file the attacker was trying to write does not exist.
    assert not db_path.exists()


# ---------------------------------------------------------------------------
# Report 2: /images/manga/save must require admin auth + sanitize filename.
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_image_save_rejects_unauthenticated(tmp_paths):
    """Report 2: anonymous request must be rejected with 401."""
    files = {"file": ("cover.png", b"fake", "image/png")}
    data = {"filename": "cover.png"}
    async with _client_with_auth(
        {
            get_current_user: _unauthenticated_dep(),
            get_current_active_superuser: _unauthenticated_dep(),
        }
    ) as client:
        response = await client.post(
            "/api/v1/images/manga/save", files=files, data=data
        )
    assert response.status_code == 401, response.text


@pytest.mark.asyncio
async def test_image_save_rejects_non_admin(tmp_paths):
    """A logged-in non-admin must not be able to upload covers.

    Only ``get_current_user`` is overridden so the real
    ``get_current_active_superuser`` role check fires and returns 403.
    """
    files = {"file": ("cover.png", b"fake", "image/png")}
    data = {"filename": "cover.png"}
    async with _client_with_auth(
        {
            get_current_user: _non_admin_dep(),
        }
    ) as client:
        response = await client.post(
            "/api/v1/images/manga/save", files=files, data=data
        )
    assert response.status_code == 403, response.text


@pytest.mark.asyncio
async def test_image_save_blocks_path_traversal(tmp_paths):
    """The exact PoC from the advisory: ``filename=../MyMangaDB.db``.

    The recommended fix is to strip the directory components with
    ``os.path.basename`` so the file lands at
    ``IMAGE_SAVE_PATH/MyMangaDB.db`` rather than clobbering
    ``DATABASE_PATH`` (which would happen because the two share a parent
    directory). The key invariant we test is that the *real* database file
    on disk is never touched, even when the attacker picks a basename that
    happens to match ``DATABASE_PATH``'s name.
    """
    db_path = tmp_paths["db_path"]
    img_dir = tmp_paths["image_path"]

    files = {"file": ("cover.png", b"not really a sqlite file", "image/png")}
    data = {"filename": "../MyMangaDB.db"}

    async with _client_with_auth(
        {
            get_current_user: _admin_dep(),
            get_current_active_superuser: _admin_dep(),
        }
    ) as client:
        response = await client.post(
            "/api/v1/images/manga/save", files=files, data=data
        )
    # Sanitization reduces the filename to ``MyMangaDB.db`` and the file
    # is written into the *images* dir. The request succeeds with the
    # sanitized name echoed back to the caller.
    assert response.status_code == 200, response.text
    body = response.json()
    assert body == {"filename": "MyMangaDB.db"}

    # The real database file must NOT have been overwritten.
    assert not db_path.exists()

    # The upload must have landed under the images directory, not the
    # parent directory that holds the database.
    assert (img_dir / "MyMangaDB.db").exists()
    # Confirm the file is INSIDE the images directory (i.e. not a symlink
    # or anything funky pointing elsewhere).
    assert (img_dir / "MyMangaDB.db").resolve().parent == img_dir.resolve()


@pytest.mark.asyncio
async def test_image_save_blocks_backslash_traversal(tmp_paths):
    """A Windows-style backslash in the filename must also be reduced to a
    safe basename via ``_sanitize_filename``."""
    files = {"file": ("cover.png", b"fake", "image/png")}
    data = {"filename": "..\\MyMangaDB.db"}
    async with _client_with_auth(
        {
            get_current_user: _admin_dep(),
            get_current_active_superuser: _admin_dep(),
        }
    ) as client:
        response = await client.post(
            "/api/v1/images/manga/save", files=files, data=data
        )
    # ``os.path.basename`` does not strip a backslash on POSIX, so our
    # ``_sanitize_filename`` rejects values that still contain ``\\``.
    assert response.status_code == 400, response.text


@pytest.mark.asyncio
async def test_image_save_blocks_dotfile(tmp_paths):
    """Dotfile-style filenames are suspicious (hidden config files)."""
    files = {"file": ("cover.png", b"fake", "image/png")}
    data = {"filename": ".htaccess"}
    async with _client_with_auth(
        {
            get_current_user: _admin_dep(),
            get_current_active_superuser: _admin_dep(),
        }
    ) as client:
        response = await client.post(
            "/api/v1/images/manga/save", files=files, data=data
        )
    assert response.status_code == 400, response.text


@pytest.mark.asyncio
async def test_image_save_blocks_nul_byte(tmp_paths):
    """A NUL byte in the filename must be rejected outright."""
    files = {"file": ("cover.png", b"fake", "image/png")}
    data = {"filename": "good\x00bad.png"}
    async with _client_with_auth(
        {
            get_current_user: _admin_dep(),
            get_current_active_superuser: _admin_dep(),
        }
    ) as client:
        response = await client.post(
            "/api/v1/images/manga/save", files=files, data=data
        )
    assert response.status_code == 400, response.text


@pytest.mark.asyncio
async def test_image_save_accepts_normal_upload(tmp_paths):
    """A well-formed admin upload must succeed and the file must land
    inside ``IMAGE_SAVE_PATH`` with the sanitized basename."""
    img_dir = tmp_paths["image_path"]
    payload = b"\x89PNG\r\n\x1a\n" + b"fake-bytes"
    files = {"file": ("cover.png", payload, "image/png")}
    data = {"filename": "1700000000_cover.png"}

    async with _client_with_auth(
        {
            get_current_user: _admin_dep(),
            get_current_active_superuser: _admin_dep(),
        }
    ) as client:
        response = await client.post(
            "/api/v1/images/manga/save", files=files, data=data
        )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body == {"filename": "1700000000_cover.png"}
    assert (img_dir / "1700000000_cover.png").read_bytes() == payload


# ---------------------------------------------------------------------------
# Image GET endpoints must also defend against traversal even though they
# are intentionally unauthenticated (the ``<img src>`` pattern cannot send
# bearer headers).
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_image_get_blocks_traversal(tmp_paths):
    """``GET /api/v1/images/manga/../MyMangaDB.db`` must 404 - the
    sanitization should reduce it to a basename lookup that does not
    exist in IMAGE_SAVE_PATH."""
    async with _client_with_auth(
        {
            get_current_user: _admin_dep(),
            get_current_active_superuser: _admin_dep(),
        }
    ) as client:
        response = await client.get("/api/v1/images/manga/..%2FMyMangaDB.db")
    # ``..%2FMyMangaDB.db`` decodes to ``../MyMangaDB.db`` but Starlette
    # resolves the path segment and the route still matches. Our
    # sanitization then reduces the filename to ``MyMangaDB.db`` which
    # is not present in IMAGE_SAVE_PATH -> 404. The key invariant is
    # that we never read DATABASE_PATH regardless of input.
    assert response.status_code == 404, response.text


@pytest.mark.asyncio
async def test_image_get_rejects_invalid_filename(tmp_paths):
    """A filename containing a backslash or NUL must be rejected with 400."""
    async with _client_with_auth(
        {
            get_current_user: _admin_dep(),
            get_current_active_superuser: _admin_dep(),
        }
    ) as client:
        # The router sees a literal backslash as a separator, so Starlette
        # won't match the route. We use a payload that should NOT decode
        # to a path traversal in any way.
        response = await client.get("/api/v1/images/manga/foo%00bar.png")
    # Anything that survives routing and ends up at the handler with a NUL
    # byte is a 400; otherwise (segment mismatch) it's a 404. Either is
    # acceptable here - the critical thing is no 200 with DB content.
    assert response.status_code in (400, 404), response.text
