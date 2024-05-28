from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.models import (
    Manga as MangaModel,
    Author as AuthorModel,
    Genre as GenreModel,
    Volume as VolumeModel,
)
from backend.app.schemas import MangaCreate, Manga


class MangaRepository:
    @staticmethod
    def create(db: Session, manga: MangaCreate) -> Manga:
        authors = [AuthorModel(**author.model_dump()) for author in manga.authors]
        genres = [GenreModel(**genre.model_dump()) for genre in manga.genres]
        volumes = [VolumeModel(**volume.model_dump()) for volume in manga.volumes]

        db_manga = MangaModel(
            title=manga.title,
            japanese_title=manga.japanese_title,
            reading_status=manga.reading_status,
            overall_status=manga.overall_status,
            star_rating=manga.star_rating,
            language=manga.language,
            category=manga.category,
            summary=manga.summary,
            cover_image=manga.cover_image,
            authors=authors,
            genres=genres,
            volumes=volumes,
        )
        db.add(db_manga)
        db.commit()
        db.refresh(db_manga)
        return Manga.model_validate(db_manga)

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 10) -> List[Manga]:
        db_mangas = db.query(MangaModel).offset(skip).limit(limit).all()
        return [Manga.model_validate(db_manga) for db_manga in db_mangas]

    @staticmethod
    def get_by_id(db: Session, manga_id: int) -> Optional[Manga]:
        db_manga = db.query(MangaModel).filter(MangaModel.id == manga_id).first()
        if db_manga:
            return Manga.model_validate(db_manga)
        return None

    @staticmethod
    def get_by_title(db: Session, title: str) -> Optional[Manga]:
        db_manga = db.query(MangaModel).filter(MangaModel.title == title).first()
        if db_manga:
            return Manga.model_validate(db_manga)
        return None

    @staticmethod
    def get_by_genre(db: Session, genre_id: int) -> List[Manga]:
        db_mangas = (
            db.query(MangaModel).filter(MangaModel.genres.any(id=genre_id)).all()
        )
        return [Manga.model_validate(db_manga) for db_manga in db_mangas]

    @staticmethod
    def get_by_author(db: Session, author_id: int) -> List[Manga]:
        db_mangas = (
            db.query(MangaModel).filter(MangaModel.authors.any(id=author_id)).all()
        )
        return [Manga.model_validate(db_manga) for db_manga in db_mangas]

    @staticmethod
    def get_by_list(db: Session, list_id: int) -> List[Manga]:
        db_mangas = db.query(MangaModel).filter(MangaModel.lists.any(id=list_id)).all()
        return [Manga.model_validate(db_manga) for db_manga in db_mangas]

    @staticmethod
    def get_by_star_rating(db: Session, rating: float) -> List[Manga]:
        db_mangas = db.query(MangaModel).filter(MangaModel.star_rating == rating).all()
        return [Manga.model_validate(db_manga) for db_manga in db_mangas]

    @staticmethod
    def update(db: Session, manga_id: int, manga: MangaCreate) -> Manga:
        db_manga = db.query(MangaModel).filter(MangaModel.id == manga_id).first()
        for key, value in manga.dict(exclude_unset=True).items():
            setattr(db_manga, key, value)
        db.commit()
        db.refresh(db_manga)
        return Manga.model_validate(db_manga)

    @staticmethod
    def delete(db: Session, manga_id: int) -> Optional[Manga]:
        db_manga = db.query(MangaModel).filter(MangaModel.id == manga_id).first()
        if db_manga:
            db.delete(db_manga)
            db.commit()
            return Manga.model_validate(db_manga)
        return None
