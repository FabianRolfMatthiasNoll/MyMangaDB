import os
from typing import AsyncGenerator, Generator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Set env vars for testing
os.environ["API_TOKEN"] = "test-token"
os.environ["DOCKER_MODE"] = "false"

from backend.app.database import get_db  # noqa: E402
from backend.app.main import app  # noqa: E402
from backend.app.models import Base  # noqa: E402
from backend.app.repositories.source import SourceRepository  # noqa: E402
from backend.app.schemas import SourceCreate  # noqa: E402

# Use in-memory SQLite database for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the production SessionLocal and engine with the test one
from backend.app import database, main  # noqa: E402

database.SessionLocal = TestingSessionLocal
database.engine = engine
main.SessionLocal = TestingSessionLocal
main.engine = engine


@pytest.fixture(scope="function")
def db_session() -> Generator:
    # Create tables
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    # Seed default sources
    default_sources = [
        SourceCreate(name="MangaPassion", language="DE"),
        SourceCreate(name="Jikan", language="EN"),
    ]
    for source in default_sources:
        SourceRepository.create(session, source)

    try:
        yield session
    finally:
        session.close()
        # Drop tables
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
async def client(db_session) -> AsyncGenerator:
    app.dependency_overrides[get_db] = lambda: db_session

    # Create a transport for the app
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        ac.headers.update({"X-API-Key": "test-token"})
        yield ac

    app.dependency_overrides.clear()
