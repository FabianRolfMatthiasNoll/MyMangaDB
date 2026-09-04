import pytest
from httpx import AsyncClient

from backend.app.repositories.manga import MangaRepository
from backend.app.schemas import Category, MangaCreate, OverallStatus, ReadingStatus


def create_manga(
    db_session,
    title: str,
    category: Category,
    reading_status: ReadingStatus,
    overall_status: OverallStatus,
    star_rating: float,
):
    return MangaRepository.create(
        db_session,
        MangaCreate(
            title=title,
            language="EN",
            category=category,
            reading_status=reading_status,
            overall_status=overall_status,
            star_rating=star_rating,
            authors=[],
            genres=[],
            lists=[],
            volumes=[],
        ),
    )


@pytest.mark.asyncio
async def test_get_mangas_applies_advanced_filters(client: AsyncClient, db_session):
    matching_manga = create_manga(
        db_session,
        "Matching Manga",
        Category.manga,
        ReadingStatus.in_progress,
        OverallStatus.ongoing,
        4.5,
    )
    create_manga(
        db_session,
        "Wrong Category",
        Category.novel,
        ReadingStatus.in_progress,
        OverallStatus.ongoing,
        4.5,
    )
    create_manga(
        db_session,
        "Wrong Reading Status",
        Category.manga,
        ReadingStatus.completed,
        OverallStatus.ongoing,
        4.5,
    )
    create_manga(
        db_session,
        "Wrong Overall Status",
        Category.manga,
        ReadingStatus.in_progress,
        OverallStatus.completed,
        4.5,
    )
    create_manga(
        db_session,
        "Wrong Rating",
        Category.manga,
        ReadingStatus.in_progress,
        OverallStatus.ongoing,
        3.0,
    )

    response = await client.get(
        "/api/v1/mangas/getAll",
        params={
            "categories": "manga",
            "reading_statuses": "in_progress",
            "overall_statuses": "ongoing",
            "rating_min": 4,
            "rating_max": 5,
        },
    )

    assert response.status_code == 200
    assert [manga["id"] for manga in response.json()] == [matching_manga.id]
