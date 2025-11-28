from sqlalchemy.orm import Session

from backend.app.repositories.manga import MangaRepository
from backend.app.schemas import Category, MangaCreate, OverallStatus, ReadingStatus


def test_create_and_get_manga(db_session: Session):
    manga_data = MangaCreate(
        title="Test Manga",
        language="EN",
        overall_status=OverallStatus.ongoing,
        category=Category.manga,
        reading_status=ReadingStatus.in_progress,
        authors=[],
        genres=[],
        lists=[],
        volumes=[],
    )
    manga = MangaRepository.create(db_session, manga_data)

    assert manga.id is not None
    assert manga.title == "Test Manga"

    fetched = MangaRepository.get_by_id(db_session, manga.id)
    assert fetched is not None
    assert fetched.title == "Test Manga"


def test_get_by_title_with_language(db_session: Session):
    manga_en = MangaCreate(
        title="Naruto",
        language="EN",
        category=Category.manga,
        authors=[],
        genres=[],
        lists=[],
        volumes=[],
    )
    manga_de = MangaCreate(
        title="Naruto",
        language="DE",
        category=Category.manga,
        authors=[],
        genres=[],
        lists=[],
        volumes=[],
    )

    MangaRepository.create(db_session, manga_en)
    MangaRepository.create(db_session, manga_de)

    fetched_en = MangaRepository.get_by_title(db_session, "Naruto", "EN")
    assert fetched_en is not None
    assert fetched_en.language == "EN"

    fetched_de = MangaRepository.get_by_title(db_session, "Naruto", "DE")
    assert fetched_de is not None
    assert fetched_de.language == "DE"
