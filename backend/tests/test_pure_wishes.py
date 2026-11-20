"""Tests for the filter that keeps the collection free of pure wishes."""

import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from backend.app.repositories.manga import MangaRepository
from backend.app.schemas import (
    Category,
    MangaCreate,
    OverallStatus,
    OwnershipStatus,
    ReadingStatus,
    VolumeCreate,
)


def create_manga(
    db_session,
    title: str,
    ownership_status: OwnershipStatus = OwnershipStatus.owned,
    volumes=(),
) -> None:
    MangaRepository.create(
        db_session,
        MangaCreate(
            title=title,
            language="EN",
            category=Category.manga,
            reading_status=ReadingStatus.not_started,
            overall_status=OverallStatus.ongoing,
            star_rating=None,
            ownership_status=ownership_status,
            authors=[],
            genres=[],
            lists=[],
            volumes=[VolumeCreate(volume_number=number) for number in volumes],
        ),
    )


@pytest.mark.asyncio
async def test_a_title_that_is_only_wanted_is_not_part_of_the_collection(
    client: AsyncClient, db_session: Session
):
    create_manga(db_session, "Wanted", OwnershipStatus.wishlist)

    response = await client.get(
        "/api/v1/mangas/getAll", params={"hide_pure_wishes": True}
    )

    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_a_title_you_own_a_volume_of_stays_in_the_collection(
    client: AsyncClient, db_session: Session
):
    create_manga(db_session, "Almost", OwnershipStatus.wishlist, volumes=["1", "2"])

    response = await client.get(
        "/api/v1/mangas/getAll", params={"hide_pure_wishes": True}
    )

    assert response.status_code == 200
    assert [manga["title"] for manga in response.json()] == ["Almost"]


@pytest.mark.asyncio
async def test_the_collection_keeps_what_is_on_the_shelf(
    client: AsyncClient, db_session: Session
):
    create_manga(db_session, "On the shelf")
    create_manga(db_session, "On the way", OwnershipStatus.ordered)
    create_manga(db_session, "Wanted", OwnershipStatus.wishlist)

    response = await client.get(
        "/api/v1/mangas/getAll", params={"hide_pure_wishes": True}
    )

    assert response.status_code == 200
    assert sorted(manga["title"] for manga in response.json()) == [
        "On the shelf",
        "On the way",
    ]


@pytest.mark.asyncio
async def test_without_the_filter_every_title_is_delivered(
    client: AsyncClient, db_session: Session
):
    create_manga(db_session, "Wanted", OwnershipStatus.wishlist)

    response = await client.get("/api/v1/mangas/getAll")

    assert response.status_code == 200
    assert [manga["title"] for manga in response.json()] == ["Wanted"]
