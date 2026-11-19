"""Tests for the MyAnimeList importer.

The importer has to decide whether an imported title is part of the
collection or only wanted - MyAnimeList's "Plan to Read" is the latter.
"""

import gzip

import pytest
from sqlalchemy.orm import Session

from backend.app.importers.mal import MALImporter
from backend.app.repositories.manga import MangaRepository
from backend.app.schemas import (
    Category,
    MangaCreate,
    OverallStatus,
    OwnershipStatus,
    ReadingStatus,
)

XML_TEMPLATE = """
  <manga>
    <manga_title>{title}</manga_title>
    <my_status>{status}</my_status>
    <my_score>{score}</my_score>
    <my_read_volumes>{volumes}</my_read_volumes>
  </manga>
"""


def build_export(entries):
    """Build a MyAnimeList export XML from ``(title, status)`` pairs."""
    body = "".join(
        XML_TEMPLATE.format(title=title, status=status, score=0, volumes=0)
        for title, status in entries
    )
    return f'<?xml version="1.0" encoding="UTF-8"?><myanimelist>{body}</myanimelist>'


class _FakeUpload:
    def __init__(self, content: bytes):
        self._content = content

    async def read(self) -> bytes:
        return self._content


class _FakeJikan:
    """Stands in for the Jikan handler so no request leaves the machine."""

    def __init__(self, title: str):
        self.title = title

    def scrape(self, _id):
        return self._manga()

    def search(self, _term):
        return [self._manga()]

    def _manga(self) -> MangaCreate:
        return MangaCreate(
            title=self.title,
            language="EN",
            category=Category.manga,
            reading_status=ReadingStatus.not_started,
            overall_status=OverallStatus.ongoing,
            star_rating=None,
            ownership_status=OwnershipStatus.owned,
            authors=[],
            genres=[],
            lists=[],
            volumes=[],
        )


def importer_for(db_session, title: str) -> MALImporter:
    importer = MALImporter(db_session)
    importer.jikan = _FakeJikan(title)
    return importer


@pytest.mark.asyncio
async def test_plan_to_read_becomes_a_wishlist_entry(db_session: Session):
    importer = importer_for(db_session, "Wanted")

    export = build_export([("Wanted", "Plan to Read")])
    result = await importer.import_list(_FakeUpload(export.encode()))

    assert result.imported == 1
    manga = MangaRepository.get_by_title(db_session, "Wanted", "EN")
    assert manga.ownership_status == OwnershipStatus.wishlist
    assert manga.reading_status == ReadingStatus.not_started


@pytest.mark.asyncio
async def test_a_finished_title_is_owned(db_session: Session):
    importer = importer_for(db_session, "Finished")

    export = build_export([("Finished", "Completed")])
    result = await importer.import_list(_FakeUpload(export.encode()))

    assert result.imported == 1
    manga = MangaRepository.get_by_title(db_session, "Finished", "EN")
    assert manga.ownership_status == OwnershipStatus.owned
    assert manga.reading_status == ReadingStatus.completed


@pytest.mark.asyncio
async def test_a_title_being_read_is_owned(db_session: Session):
    importer = importer_for(db_session, "In Progress")

    export = build_export([("In Progress", "Reading")])
    await importer.import_list(_FakeUpload(export.encode()))

    manga = MangaRepository.get_by_title(db_session, "In Progress", "EN")
    assert manga.ownership_status == OwnershipStatus.owned


@pytest.mark.asyncio
async def test_a_gzipped_export_is_imported(db_session: Session):
    importer = importer_for(db_session, "Wanted")

    export = build_export([("Wanted", "Plan to Read")]).encode()
    result = await importer.import_list(_FakeUpload(gzip.compress(export)))

    assert result.imported == 1
    manga = MangaRepository.get_by_title(db_session, "Wanted", "EN")
    assert manga.ownership_status == OwnershipStatus.wishlist


@pytest.mark.asyncio
async def test_a_broken_export_does_not_raise(db_session: Session):
    importer = importer_for(db_session, "Anything")

    result = await importer.import_list(_FakeUpload(b"not xml at all"))

    assert result.total == 0
    assert result.imported == 0
    assert [log.info_code for log in result.logs] == ["INVALID_XML"]
