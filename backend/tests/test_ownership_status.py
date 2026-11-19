"""Tests for the ownership status of a manga."""

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
)


def create_manga(
    db_session,
    title: str,
    ownership_status: OwnershipStatus = OwnershipStatus.owned,
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
            volumes=[],
        ),
    )


def test_a_new_manga_is_owned_by_default(db_session: Session):
    create_manga(db_session, "Default")

    manga = MangaRepository.get_by_title(db_session, "Default", "EN")

    assert manga.ownership_status == OwnershipStatus.owned


def test_the_ownership_status_is_stored(db_session: Session):
    create_manga(db_session, "Wanted", OwnershipStatus.wishlist)

    manga = MangaRepository.get_by_title(db_session, "Wanted", "EN")

    assert manga.ownership_status == OwnershipStatus.wishlist


def test_the_ownership_status_can_be_changed(db_session: Session):
    create_manga(db_session, "Ordered", OwnershipStatus.ordered)

    manga = MangaRepository.get_by_title(db_session, "Ordered", "EN")
    manga.ownership_status = OwnershipStatus.owned
    MangaRepository.update(db_session, manga)

    updated = MangaRepository.get_by_title(db_session, "Ordered", "EN")

    assert updated.ownership_status == OwnershipStatus.owned


def test_the_reading_status_stays_independent(db_session: Session):
    create_manga(db_session, "Wanted", OwnershipStatus.wishlist)

    manga = MangaRepository.get_by_title(db_session, "Wanted", "EN")

    # A wanted title is not started - but it is not owned either.
    assert manga.reading_status == ReadingStatus.not_started
    assert manga.ownership_status == OwnershipStatus.wishlist


@pytest.mark.asyncio
async def test_the_collection_can_be_filtered_by_ownership_status(
    client: AsyncClient, db_session
):
    create_manga(db_session, "On the shelf")
    create_manga(db_session, "Wanted", OwnershipStatus.wishlist)
    create_manga(db_session, "On the way", OwnershipStatus.ordered)

    response = await client.get(
        "/api/v1/mangas/getAll", params={"ownership_statuses": "wishlist"}
    )

    assert response.status_code == 200
    assert [manga["title"] for manga in response.json()] == ["Wanted"]
    assert response.json()[0]["ownership_status"] == "wishlist"


@pytest.mark.asyncio
async def test_filtering_by_several_ownership_statuses(client: AsyncClient, db_session):
    create_manga(db_session, "On the shelf")
    create_manga(db_session, "Wanted", OwnershipStatus.wishlist)
    create_manga(db_session, "On the way", OwnershipStatus.ordered)

    response = await client.get(
        "/api/v1/mangas/getAll",
        params={"ownership_statuses": ["wishlist", "ordered"]},
    )

    assert response.status_code == 200
    assert sorted(manga["title"] for manga in response.json()) == [
        "On the way",
        "Wanted",
    ]
