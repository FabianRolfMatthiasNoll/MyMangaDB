"""Regression tests for GHSA-2223-v44q-q2hc.

The backend used to sign its session tokens with a hard-coded key
(``insecure-secret-key``) whenever ``API_TOKEN`` was not set. Anybody could
therefore mint a valid admin token offline and take over the instance.

These tests pin down the fixed behaviour:

* there is no built-in default key - the backend fails closed instead,
* a missing ``API_TOKEN`` results in a random, persisted key,
* tokens forged with the old public default are rejected,
* the ``backend/.env`` file is read before the settings are used.
"""

import base64
import hashlib
import hmac
import json
import os
import shutil
import subprocess
import sys
import time
from datetime import timedelta
from pathlib import Path

import jwt
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.core import security
from backend.app.database import get_db
from backend.app.main import app
from backend.app.models import Role
from backend.app.repositories import UserRepository
from backend.app.schemas import UserCreate

REPO_ROOT = Path(__file__).resolve().parents[2]

# The key that used to be hard-coded into the backend.
PUBLIC_DEFAULT_KEY = "insecure-secret-key"


def _forge_token(key: str, subject: str = "admin", expires_in: int = 3600) -> str:
    """Mint a HS256 token with an arbitrary key (stdlib only)."""

    def b64(raw: bytes) -> bytes:
        return base64.urlsafe_b64encode(raw).rstrip(b"=")

    header = b64(
        json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode()
    )
    payload = b64(
        json.dumps(
            {"sub": subject, "exp": int(time.time()) + expires_in},
            separators=(",", ":"),
        ).encode()
    )
    signing_input = header + b"." + payload
    signature = b64(hmac.new(key.encode(), signing_input, hashlib.sha256).digest())
    return (signing_input + b"." + signature).decode()


@pytest.fixture(autouse=True)
def _reset_secret_key_cache():
    """The signing key is cached per process - make sure tests do not leak."""
    security.reset_secret_key_cache()
    yield
    security.reset_secret_key_cache()


@pytest.fixture
def no_env_key(monkeypatch):
    """Simulate an installation without ``API_TOKEN`` / ``SECRET_KEY``."""
    monkeypatch.delenv("API_TOKEN", raising=False)
    monkeypatch.delenv("SECRET_KEY", raising=False)


@pytest.fixture
def temp_database(monkeypatch, tmp_path):
    """Point the persisted signing key at a temporary directory."""
    db_path = tmp_path / "MyMangaDB.db"
    monkeypatch.setattr("backend.config.DATABASE_PATH", str(db_path))
    return tmp_path


# ---------------------------------------------------------------------------
# The core fix: no hard-coded fallback key.
# ---------------------------------------------------------------------------


def test_no_public_default_key_is_embedded_in_the_source():
    """The old ``os.getenv("API_TOKEN", "insecure-secret-key")`` fallback must
    be gone - the key must never have a publicly known default."""
    source = (REPO_ROOT / "backend" / "app" / "core" / "security.py").read_text()
    assert 'getenv("API_TOKEN",' not in source
    assert "SECRET_KEY = os.getenv" not in source


def test_insecure_keys_are_never_used():
    """Publicly known values are rejected instead of being used."""
    assert PUBLIC_DEFAULT_KEY in security.INSECURE_KEYS
    for candidate in ("changeme", "secret", "your-secret-key", "token"):
        assert candidate in security.INSECURE_KEYS


def test_public_default_key_is_rejected_from_the_environment(monkeypatch):
    """An operator that explicitly configures the old default must not end up
    with a guessable key - the backend fails closed."""
    monkeypatch.setenv("API_TOKEN", PUBLIC_DEFAULT_KEY)
    security.reset_secret_key_cache()
    with pytest.raises(RuntimeError):
        security.get_secret_key()


def test_weak_key_from_the_environment_is_rejected(monkeypatch):
    monkeypatch.setenv("API_TOKEN", "changeme")
    security.reset_secret_key_cache()
    with pytest.raises(RuntimeError):
        security.get_secret_key()


def test_forged_token_with_public_default_is_rejected(monkeypatch):
    """The exact attack from the advisory: a token signed with the old public
    default must not authenticate."""
    monkeypatch.setenv("API_TOKEN", "a-properly-random-test-key-value-0123456789")
    security.reset_secret_key_cache()

    forged = _forge_token(PUBLIC_DEFAULT_KEY, subject="admin")
    with pytest.raises(jwt.PyJWTError):
        security.decode_access_token(forged)


def test_resolved_key_is_never_a_public_default(monkeypatch, temp_database):
    """Whatever the configuration, the effective key must not be guessable."""
    monkeypatch.delenv("API_TOKEN", raising=False)
    monkeypatch.delenv("SECRET_KEY", raising=False)
    security.reset_secret_key_cache()

    key = security.get_secret_key()
    assert key not in security.INSECURE_KEYS
    assert key != PUBLIC_DEFAULT_KEY


# ---------------------------------------------------------------------------
# Missing API_TOKEN: a random key is generated and persisted.
# ---------------------------------------------------------------------------


def test_missing_api_token_generates_and_persists_a_random_key(
    no_env_key, temp_database
):
    key = security.get_secret_key()

    assert len(key) >= 32
    assert key not in security.INSECURE_KEYS

    key_file = temp_database / ".secret_key"
    assert key_file.is_file()
    assert key_file.read_text().strip() == key


def test_persisted_key_is_reused_across_restarts(no_env_key, temp_database):
    """A restart must not invalidate all sessions."""
    first = security.get_secret_key()

    security.reset_secret_key_cache()  # simulate a restart
    second = security.get_secret_key()

    assert first == second


def test_generated_keys_differ_between_installations(no_env_key, monkeypatch, tmp_path):
    """Two installations must not share the same key."""
    monkeypatch.setattr(
        "backend.config.DATABASE_PATH", str(tmp_path / "a" / "MyMangaDB.db")
    )
    first = security.get_secret_key()

    security.reset_secret_key_cache()
    monkeypatch.setattr(
        "backend.config.DATABASE_PATH", str(tmp_path / "b" / "MyMangaDB.db")
    )
    second = security.get_secret_key()

    assert first != second


@pytest.mark.skipif(sys.platform == "win32", reason="POSIX file permissions")
def test_persisted_key_file_is_not_readable_by_other_users(no_env_key, temp_database):
    security.get_secret_key()
    key_file = temp_database / ".secret_key"
    assert oct(key_file.stat().st_mode & 0o777) == oct(0o600)


def test_backend_fails_closed_when_the_key_cannot_be_persisted(
    no_env_key, monkeypatch, tmp_path
):
    """If the key cannot be stored the backend must refuse to run instead of
    using a guessable key."""
    blocker = tmp_path / "blocker"
    blocker.write_text("not a directory")
    monkeypatch.setattr("backend.config.DATABASE_PATH", str(blocker / "MyMangaDB.db"))

    security.reset_secret_key_cache()
    with pytest.raises(RuntimeError):
        security.get_secret_key()


# ---------------------------------------------------------------------------
# Token handling.
# ---------------------------------------------------------------------------


def test_token_round_trip(monkeypatch):
    monkeypatch.setenv("API_TOKEN", "a-properly-random-test-key-value-0123456789")
    security.reset_secret_key_cache()

    token = security.create_access_token({"sub": "admin"})
    payload = security.decode_access_token(token)

    assert payload["sub"] == "admin"


def test_token_without_subject_is_rejected(monkeypatch):
    monkeypatch.setenv("API_TOKEN", "a-properly-random-test-key-value-0123456789")
    security.reset_secret_key_cache()

    token = security.create_access_token({"role": "admin"})
    with pytest.raises(jwt.MissingRequiredClaimError):
        security.decode_access_token(token)


def test_expired_token_is_rejected(monkeypatch):
    monkeypatch.setenv("API_TOKEN", "a-properly-random-test-key-value-0123456789")
    security.reset_secret_key_cache()

    token = security.create_access_token(
        {"sub": "admin"}, expires_delta=timedelta(minutes=-1)
    )
    with pytest.raises(jwt.ExpiredSignatureError):
        security.decode_access_token(token)


# ---------------------------------------------------------------------------
# The backend/.env file has to be read before the settings are used.
# ---------------------------------------------------------------------------


def test_env_file_is_loaded_before_the_settings_are_used(tmp_path):
    """Regression test for the import order: ``backend/.env`` used to be
    loaded *after* the modules had already read the environment, so the
    configured ``API_TOKEN`` was ignored and the fallback key was used."""
    package_dir = tmp_path / "backend"
    shutil.copytree(
        REPO_ROOT / "backend",
        package_dir,
        ignore=shutil.ignore_patterns(
            ".venv", "__pycache__", "data", ".env", "*.db", "*.pyc"
        ),
    )
    (package_dir / ".env").write_text("API_TOKEN=token-from-the-env-file\n")

    script = (
        "from backend.app.core import security\n"
        "import os\n"
        "key = security.get_secret_key()\n"
        "print('MATCH' if key == os.environ['API_TOKEN'] else 'MISMATCH')\n"
    )
    env = {
        key: value
        for key, value in os.environ.items()
        if key not in ("API_TOKEN", "SECRET_KEY")
    }
    env["PYTHONPATH"] = str(tmp_path)

    result = subprocess.run(
        [sys.executable, "-c", script],
        cwd=str(tmp_path),
        env=env,
        capture_output=True,
        text=True,
        timeout=120,
    )

    assert result.returncode == 0, result.stderr
    assert "MATCH" in result.stdout, result.stdout


# ---------------------------------------------------------------------------
# End to end: the forged token must not reach an admin endpoint.
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_forged_admin_token_is_rejected_by_the_api(db_session):
    """The full attack from the advisory against a live app instance."""
    UserRepository.create(
        db_session, UserCreate(username="admin", password="admin", role=Role.admin)
    )
    db_session.commit()

    app.dependency_overrides[get_db] = lambda: db_session
    transport = ASGITransport(app=app)
    forged = _forge_token(PUBLIC_DEFAULT_KEY, subject="admin")

    try:
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(
                "/api/v1/database/export",
                headers={"Authorization": f"Bearer {forged}"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 401, response.text


@pytest.mark.asyncio
async def test_a_validly_signed_token_is_accepted(db_session):
    """Positive control: a token signed with the real key still works."""
    UserRepository.create(
        db_session, UserCreate(username="admin", password="admin", role=Role.admin)
    )
    db_session.commit()

    app.dependency_overrides[get_db] = lambda: db_session
    transport = ASGITransport(app=app)
    token = security.create_access_token({"sub": "admin"})

    try:
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(
                "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200, response.text
    assert response.json()["username"] == "admin"


# ---------------------------------------------------------------------------
# Deployment configuration.
# ---------------------------------------------------------------------------


def test_docker_compose_requires_the_api_token():
    """The compose file must not start the backend without a secret."""
    compose = (REPO_ROOT / "docker-compose.yml").read_text()
    assert "${API_TOKEN:?" in compose
    assert "API_TOKEN: ${API_TOKEN}\n" not in compose
