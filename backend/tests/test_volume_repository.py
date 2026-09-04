import os
from pathlib import Path

import pytest
from sqlalchemy.orm import Session

from backend.app import settings
from backend.app.models import Volume as VolumeModel
from backend.app.repositories import MangaRepository, VolumeRepository
from backend.app.repositories.base import RepositoryError
from backend.app.schemas import Category, MangaCreate, OverallStatus, ReadingStatus


def _make_manga(db: Session, title: str = "Cover Test") -> int:
    manga = MangaRepository.create(
        db,
        MangaCreate(
            title=title,
            language="EN",
            overall_status=OverallStatus.ongoing,
            category=Category.manga,
            reading_status=ReadingStatus.in_progress,
            authors=[],
            genres=[],
            lists=[],
            volumes=[],
        ),
    )
    return manga.id


def _make_volume(db: Session, manga_id: int, number: str = "1") -> int:
    volume = VolumeModel(volume_number=number, manga_id=manga_id)
    db.add(volume)
    db.commit()
    db.refresh(volume)
    return volume.id


def _touch(path: str) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_bytes(b"x")


def test_update_cover_writes_filename(db_session: Session, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "IMAGE_SAVE_PATH", str(tmp_path))
    manga_id = _make_manga(db_session)
    volume_id = _make_volume(db_session, manga_id)

    VolumeRepository.update_cover(db_session, manga_id, volume_id, "vol1.jpg")

    volume = db_session.query(VolumeModel).filter(VolumeModel.id == volume_id).one()
    assert volume.cover_image == "vol1.jpg"


def test_update_cover_replaces_old_file(db_session: Session, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "IMAGE_SAVE_PATH", str(tmp_path))
    manga_id = _make_manga(db_session)
    volume_id = _make_volume(db_session, manga_id)

    old_path = os.path.join(str(tmp_path), "old.jpg")
    _touch(old_path)
    VolumeRepository.update_cover(db_session, manga_id, volume_id, "old.jpg")

    VolumeRepository.update_cover(db_session, manga_id, volume_id, "new.jpg")

    assert not os.path.exists(old_path)
    volume = db_session.query(VolumeModel).filter(VolumeModel.id == volume_id).one()
    assert volume.cover_image == "new.jpg"


def test_update_cover_same_filename_is_idempotent(
    db_session: Session, tmp_path, monkeypatch
):
    monkeypatch.setattr(settings, "IMAGE_SAVE_PATH", str(tmp_path))
    manga_id = _make_manga(db_session)
    volume_id = _make_volume(db_session, manga_id)

    VolumeRepository.update_cover(db_session, manga_id, volume_id, "same.jpg")

    # Second call with the same filename should NOT delete the file.
    VolumeRepository.update_cover(db_session, manga_id, volume_id, "same.jpg")
    volume = db_session.query(VolumeModel).filter(VolumeModel.id == volume_id).one()
    assert volume.cover_image == "same.jpg"


def test_clear_cover_removes_file_and_nulls_column(
    db_session: Session, tmp_path, monkeypatch
):
    monkeypatch.setattr(settings, "IMAGE_SAVE_PATH", str(tmp_path))
    manga_id = _make_manga(db_session)
    volume_id = _make_volume(db_session, manga_id)

    path = os.path.join(str(tmp_path), "to_clear.jpg")
    _touch(path)
    VolumeRepository.update_cover(db_session, manga_id, volume_id, "to_clear.jpg")

    VolumeRepository.clear_cover(db_session, manga_id, volume_id)

    assert not os.path.exists(path)
    volume = db_session.query(VolumeModel).filter(VolumeModel.id == volume_id).one()
    assert volume.cover_image is None


def test_clear_cover_when_absent_is_idempotent(
    db_session: Session, tmp_path, monkeypatch
):
    monkeypatch.setattr(settings, "IMAGE_SAVE_PATH", str(tmp_path))
    manga_id = _make_manga(db_session)
    volume_id = _make_volume(db_session, manga_id)

    VolumeRepository.clear_cover(db_session, manga_id, volume_id)

    volume = db_session.query(VolumeModel).filter(VolumeModel.id == volume_id).one()
    assert volume.cover_image is None


def test_update_cover_unknown_volume_raises(db_session: Session, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "IMAGE_SAVE_PATH", str(tmp_path))
    manga_id = _make_manga(db_session)

    with pytest.raises(RepositoryError):
        VolumeRepository.update_cover(db_session, manga_id, 9999, "x.jpg")


def test_update_cover_wrong_manga_raises(db_session: Session, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "IMAGE_SAVE_PATH", str(tmp_path))
    other_manga_id = _make_manga(db_session, title="Other")
    volume_id = _make_volume(db_session, other_manga_id)

    with pytest.raises(RepositoryError):
        VolumeRepository.update_cover(
            db_session,
            manga_id=other_manga_id + 1,
            volume_id=volume_id,
            filename="x.jpg",
        )


def test_clear_cover_unknown_volume_raises(db_session: Session, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "IMAGE_SAVE_PATH", str(tmp_path))
    manga_id = _make_manga(db_session)

    with pytest.raises(RepositoryError):
        VolumeRepository.clear_cover(db_session, manga_id, 9999)
