from sqlalchemy.orm import Session

from backend.app.repositories.source import SourceRepository
from backend.app.schemas import SourceCreate


def test_create_source(db_session: Session):
    source_data = SourceCreate(name="Test Source", language="EN")
    source = SourceRepository.create(db_session, source_data)

    assert source.id is not None
    assert source.name == "Test Source"
    assert source.language == "EN"

    # Verify it's in the DB
    fetched = SourceRepository.get_by_name(db_session, "Test Source")
    assert fetched is not None
    assert fetched.id == source.id


def test_get_all_sources(db_session: Session):
    sources = SourceRepository.get_all(db_session)
    assert len(sources) >= 2
    names = [s.name for s in sources]
    assert "MangaPassion" in names
    assert "Jikan" in names
