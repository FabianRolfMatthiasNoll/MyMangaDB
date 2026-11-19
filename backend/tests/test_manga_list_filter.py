"""The list filter used to be smuggled in through the search string.

``GET /mangas/getAll?search=list:Favourites`` was interpreted by the
repository as "filter by list". That made every manga whose title started
with ``list:`` unsearchable and forced the frontend to overload the search
box. The list is now a query parameter of its own.
"""

import pytest
from httpx import AsyncClient

from backend.app.repositories.list import ListRepository
from backend.app.repositories.manga import MangaRepository
from backend.app.schemas import (
    Category,
    ListCreate,
    MangaCreate,
    OverallStatus,
    ReadingStatus,
)


def create_manga(db_session, title: str, list_names=()):
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
            lists=[ListCreate(name=name) for name in list_names],
            volumes=[],
        ),
    )


@pytest.mark.asyncio
async def test_filters_by_list_id(client: AsyncClient, db_session):
    shelf = ListRepository.create(db_session, ListCreate(name="Shelf"))
    create_manga(db_session, "On the shelf", ["Shelf"])
    create_manga(db_session, "Not on the shelf", ["Other"])

    response = await client.get("/api/v1/mangas/getAll", params={"list_id": shelf.id})

    assert response.status_code == 200
    assert [manga["title"] for manga in response.json()] == ["On the shelf"]


@pytest.mark.asyncio
async def test_a_title_starting_with_list_is_searchable(
    client: AsyncClient, db_session
):
    create_manga(db_session, "list: something", ["Shelf"])
    create_manga(db_session, "Something else", ["Shelf"])

    response = await client.get("/api/v1/mangas/getAll", params={"search": "list:"})

    assert response.status_code == 200
    assert [manga["title"] for manga in response.json()] == ["list: something"]


@pytest.mark.asyncio
async def test_without_a_list_filter_everything_is_returned(
    client: AsyncClient, db_session
):
    create_manga(db_session, "A", ["Shelf"])
    create_manga(db_session, "B", ["Other"])

    response = await client.get("/api/v1/mangas/getAll")

    assert response.status_code == 200
    assert len(response.json()) == 2
