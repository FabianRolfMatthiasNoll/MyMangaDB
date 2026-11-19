from sqlalchemy import event
from sqlalchemy.orm import Session

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


def test_counts_manga_per_list(db_session: Session):
    ListRepository.create(db_session, ListCreate(name="Empty List"))
    ListRepository.create(db_session, ListCreate(name="One Manga"))
    ListRepository.create(db_session, ListCreate(name="Two Mangas"))

    create_manga(db_session, "A", ["One Manga"])
    create_manga(db_session, "B", ["Two Mangas"])
    create_manga(db_session, "C", ["Two Mangas"])
    create_manga(db_session, "D", [])

    counts = {
        entry["name"]: entry["mangaCount"]
        for entry in ListRepository.get_with_manga_count(db_session)
    }

    assert counts == {"Empty List": 0, "One Manga": 1, "Two Mangas": 2}


def test_counts_are_zero_for_lists_without_manga(db_session: Session):
    ListRepository.create(db_session, ListCreate(name="Empty"))

    counts = ListRepository.get_with_manga_count(db_session)

    assert len(counts) == 1
    assert counts[0]["mangaCount"] == 0


def test_counts_survive_a_manga_being_deleted(db_session: Session):
    ListRepository.create(db_session, ListCreate(name="Shelf"))
    manga = create_manga(db_session, "A", ["Shelf"])

    assert ListRepository.get_with_manga_count(db_session)[0]["mangaCount"] == 1

    MangaRepository.delete(db_session, manga.id)

    assert ListRepository.get_with_manga_count(db_session)[0]["mangaCount"] == 0


def test_counts_are_fetched_with_a_single_query(db_session: Session):
    """Counting must not degrade into one query per list."""
    for index in range(5):
        ListRepository.create(db_session, ListCreate(name=f"List {index}"))
        create_manga(db_session, f"Manga {index}", [f"List {index}"])

    statements = []

    def count_statement(*args):
        statements.append(args[2])

    event.listen(db_session.get_bind(), "before_cursor_execute", count_statement)
    try:
        ListRepository.get_with_manga_count(db_session)
    finally:
        event.remove(db_session.get_bind(), "before_cursor_execute", count_statement)

    assert len(statements) == 1
