import pytest
from httpx import AsyncClient

from backend.app.repositories.manga import MangaRepository
from backend.app.schemas import (
    Category,
    Manga,
    MangaCreate,
    OverallStatus,
    ReadingStatus,
)


def create_manga(db_session, title: str) -> Manga:
    return MangaRepository.create(
        db_session,
        MangaCreate(
            title=title,
            language="EN",
            category=Category.manga,
            reading_status=ReadingStatus.in_progress,
            overall_status=OverallStatus.ongoing,
            star_rating=4.0,
            authors=[],
            genres=[],
            lists=[],
            volumes=[],
        ),
    )


@pytest.mark.asyncio
async def test_get_missing_manga_returns_404(client: AsyncClient, db_session):
    """A missing manga must surface as 404, not as a swallowed 500.

    ``HTTPException`` is a subclass of ``Exception``, so a generic
    ``except Exception`` around the lookup used to turn the 404 into a 500.
    """
    response = await client.get("/api/v1/mangas/999999")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_missing_manga_returns_404(client: AsyncClient, db_session):
    payload = {
        "id": 999999,
        "title": "Ghost",
        "category": "manga",
        "authors": [],
        "genres": [],
        "lists": [],
        "volumes": [],
    }

    response = await client.put("/api/v1/mangas/update", json=payload)

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_missing_manga_returns_404(client: AsyncClient, db_session):
    response = await client.delete("/api/v1/mangas/999999")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_existing_manga_returns_200(client: AsyncClient, db_session):
    manga = create_manga(db_session, "Existing Manga")

    response = await client.get(f"/api/v1/mangas/{manga.id}")

    assert response.status_code == 200
    assert response.json()["title"] == "Existing Manga"
