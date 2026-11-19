"""The manga counters of authors and genres are derived, not stored.

A denormalized counter has to be updated by every code path that adds or
removes a manga-author (or manga-genre) link. A single missed path leaves it
permanently wrong, so the count is computed from the join table instead.
"""

from sqlalchemy.orm import Session

from backend.app.models import Author, Genre
from backend.app.repositories.author import AuthorRepository
from backend.app.repositories.genre import GenreRepository
from backend.app.repositories.manga import MangaRepository
from backend.app.schemas import (
    AuthorCreate,
    Category,
    GenreCreate,
    MangaCreate,
    OverallStatus,
    ReadingStatus,
)


def create_manga(db_session, title, authors=(), genres=()):
    return MangaRepository.create(
        db_session,
        MangaCreate(
            title=title,
            language="EN",
            category=Category.manga,
            reading_status=ReadingStatus.in_progress,
            overall_status=OverallStatus.ongoing,
            star_rating=4.0,
            authors=[AuthorCreate(name=name) for name in authors],
            genres=[GenreCreate(name=name) for name in genres],
            lists=[],
            volumes=[],
        ),
    )


def test_author_count_reflects_the_manga(db_session: Session):
    create_manga(db_session, "A", authors=["Eiichiro Oda"])
    create_manga(db_session, "B", authors=["Eiichiro Oda"])
    create_manga(db_session, "C", authors=["Kentaro Miura"])

    assert AuthorRepository.get_by_id(db_session, 1).manga_count == 2
    assert AuthorRepository.get_by_id(db_session, 2).manga_count == 1


def test_genre_count_reflects_the_manga(db_session: Session):
    create_manga(db_session, "A", genres=["Action"])
    create_manga(db_session, "B", genres=["Action", "Fantasy"])

    assert GenreRepository.get_by_id(db_session, 1).manga_count == 2
    assert GenreRepository.get_by_id(db_session, 2).manga_count == 1


def test_count_drops_when_the_manga_is_deleted(db_session: Session):
    manga = create_manga(db_session, "A", authors=["Eiichiro Oda"], genres=["Action"])

    assert AuthorRepository.get_by_id(db_session, 1).manga_count == 1

    MangaRepository.delete(db_session, manga.id)

    assert AuthorRepository.get_by_id(db_session, 1).manga_count == 0
    assert GenreRepository.get_by_id(db_session, 1).manga_count == 0


def test_count_is_updated_when_the_authors_change(db_session: Session):
    manga = create_manga(db_session, "A", authors=["Eiichiro Oda"])

    updated = manga.model_copy(
        update={
            "authors": [AuthorCreate(name="Kentaro Miura")],
            "genres": [],
        }
    )
    MangaRepository.update(db_session, updated)

    assert AuthorRepository.get_by_id(db_session, 1).manga_count == 0
    assert AuthorRepository.get_by_id(db_session, 2).manga_count == 1


def test_counts_are_listed_for_every_author(db_session: Session):
    create_manga(db_session, "A", authors=["Eiichiro Oda"])

    authors = AuthorRepository.get_all(db_session)
    counts = {author.name: author.manga_count for author in authors}

    assert counts == {"Eiichiro Oda": 1}


def test_the_count_column_is_not_stored(db_session: Session):
    """The counter must not be a mapped column any more."""
    assert "manga_count" not in Author.__table__.columns
    assert "manga_count" not in Genre.__table__.columns
