"""Tests for the added-at date and the priority flag."""

from datetime import datetime

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


def create_manga(db_session, title: str, priority: bool = False) -> None:
    MangaRepository.create(
        db_session,
        MangaCreate(
            title=title,
            language="EN",
            category=Category.manga,
            reading_status=ReadingStatus.not_started,
            overall_status=OverallStatus.ongoing,
            star_rating=None,
            ownership_status=OwnershipStatus.wishlist,
            priority=priority,
            authors=[],
            genres=[],
            lists=[],
            volumes=[],
        ),
    )


def test_a_new_manga_gets_an_added_at_date(db_session: Session):
    create_manga(db_session, "Fresh")

    manga = MangaRepository.get_by_title(db_session, "Fresh", "EN")

    assert isinstance(manga.added_at, datetime)


def test_a_new_manga_is_not_prioritised(db_session: Session):
    create_manga(db_session, "Fresh")

    manga = MangaRepository.get_by_title(db_session, "Fresh", "EN")

    assert manga.priority is False


def test_the_priority_is_stored(db_session: Session):
    create_manga(db_session, "Urgent", priority=True)

    manga = MangaRepository.get_by_title(db_session, "Urgent", "EN")

    assert manga.priority is True


def test_the_priority_can_be_changed(db_session: Session):
    create_manga(db_session, "Urgent")
    manga = MangaRepository.get_by_title(db_session, "Urgent", "EN")

    manga.priority = True
    MangaRepository.update(db_session, manga)

    updated = MangaRepository.get_by_title(db_session, "Urgent", "EN")

    assert updated.priority is True


def test_editing_a_manga_does_not_change_the_added_at_date(db_session: Session):
    create_manga(db_session, "Fresh")
    manga = MangaRepository.get_by_title(db_session, "Fresh", "EN")
    original = manga.added_at

    manga.title = "Renamed"
    MangaRepository.update(db_session, manga)

    updated = MangaRepository.get_by_title(db_session, "Renamed", "EN")

    assert updated.added_at == original


@pytest.mark.asyncio
async def test_the_api_exposes_the_new_fields(client: AsyncClient, db_session):
    create_manga(db_session, "Wanted", priority=True)

    response = await client.get("/api/v1/mangas/getAll")

    assert response.status_code == 200
    payload = response.json()[0]
    assert payload["priority"] is True
    assert payload["added_at"]
