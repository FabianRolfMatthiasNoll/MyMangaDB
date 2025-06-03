from typing import List as TypedList, Optional
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session
from backend.app.models import (
    Manga as MangaModel,
    Author as AuthorModel,
    Genre as GenreModel,
    Volume as VolumeModel,
    List as ListModel,
)
from backend.app.schemas import MangaCreate, Manga
from .base import BaseRepository, RepositoryError
import os
import uuid
import requests
from backend.app import settings
import logging

logger = logging.getLogger(__name__)


class MangaRepository(BaseRepository):
    @staticmethod
    def get_by_title(db: Session, title: str) -> Optional[Manga]:
        manga = db.query(MangaModel).filter(MangaModel.title == title).first()
        return Manga.model_validate(manga) if manga else None

    @staticmethod
    def get_by_id(db: Session, manga_id: int) -> Optional[Manga]:
        manga = db.query(MangaModel).filter(MangaModel.id == manga_id).first()
        return Manga.model_validate(manga) if manga else None

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        sort: Optional[str] = "asc",
    ) -> TypedList[Manga]:
        """
        Holt Mangas mit Paging. Optional: Filter nach Titel (ILIKE '%search%'), Sortierung.
        """
        query = db.query(MangaModel)

        # Volltextsuche (case-insensitive) im Titel
        if search:
            ilike_term = f"%{search}%"
            query = query.filter(MangaModel.title.ilike(ilike_term))

        # Sortierung nach Titel
        if sort == "asc":
            query = query.order_by(asc(MangaModel.title))
        else:
            query = query.order_by(desc(MangaModel.title))

        mangas = query.offset(skip).limit(limit).all()
        return [Manga.model_validate(m) for m in mangas]

    @staticmethod
    def create_batch(db: Session, mangas: TypedList[MangaCreate]) -> TypedList[Manga]:
        db_mangas = []
        try:
            for manga in mangas:
                db_manga = MangaRepository.create(db, manga)
                db_mangas.append(db_manga)
            return db_mangas
        except Exception as e:
            db.rollback()
            raise ValueError(f"Failed to create manga batch: {e}")

    @staticmethod
    def create(db: Session, manga_create: MangaCreate) -> Manga:
        if db.query(MangaModel).filter(MangaModel.title == manga_create.title).first():
            raise RepositoryError(f"Manga '{manga_create.title}' already exists")

        # Process related entities using the common find_or_create functionality.
        authors = [
            BaseRepository.find_or_create(
                db, AuthorModel, AuthorModel.name, author.name
            )
            for author in manga_create.authors
        ]
        genres = [
            BaseRepository.find_or_create(db, GenreModel, GenreModel.name, genre.name)
            for genre in manga_create.genres
        ]
        lists_ = [
            BaseRepository.find_or_create(db, ListModel, ListModel.name, lst.name)
            for lst in manga_create.lists
        ]
        volumes = [VolumeModel(**vol.model_dump()) for vol in manga_create.volumes]

        cover_image_filename = MangaRepository._handle_cover_image(
            manga_create.cover_image
        )

        db_manga = MangaModel(
            title=manga_create.title,
            japanese_title=manga_create.japanese_title,
            reading_status=manga_create.reading_status,
            overall_status=manga_create.overall_status,
            star_rating=manga_create.star_rating,
            language=manga_create.language,
            category=manga_create.category,
            summary=manga_create.summary,
            cover_image=cover_image_filename,
            authors=authors,
            genres=genres,
            lists=lists_,
            volumes=volumes,
        )
        db.add(db_manga)
        BaseRepository.commit_session(db)
        db.refresh(db_manga)
        return Manga.model_validate(db_manga)

    @staticmethod
    def update(db: Session, manga_data: Manga) -> Manga:
        db_manga = db.query(MangaModel).filter(MangaModel.id == manga_data.id).first()
        if not db_manga:
            raise RepositoryError("Manga not found")

        # Handle cover image update
        if manga_data.cover_image != db_manga.cover_image:
            # Remove old cover image if it exists
            if db_manga.cover_image is not None:
                old_cover_path = os.path.join(settings.IMAGE_SAVE_PATH, str(db_manga.cover_image))
                if os.path.exists(old_cover_path):
                    try:
                        os.remove(old_cover_path)
                    except Exception as e:
                        logger.warning("Failed to remove old cover image: %s", e)

        # Update scalar fields
        for field in [
            "title",
            "japanese_title",
            "reading_status",
            "overall_status",
            "star_rating",
            "language",
            "category",
            "summary",
            "cover_image",
        ]:
            setattr(db_manga, field, getattr(manga_data, field))

        # Update relationships
        db_manga.authors = [
            BaseRepository.find_or_create(
                db, AuthorModel, AuthorModel.name, author.name
            )
            for author in manga_data.authors
        ]
        db_manga.genres = [
            BaseRepository.find_or_create(db, GenreModel, GenreModel.name, genre.name)
            for genre in manga_data.genres
        ]
        db_manga.lists = [
            BaseRepository.find_or_create(db, ListModel, ListModel.name, lst.name)
            for lst in manga_data.lists
        ]
        db_manga.volumes = [
            VolumeModel(**vol.model_dump()) for vol in manga_data.volumes
        ]

        BaseRepository.commit_session(db)
        db.refresh(db_manga)
        return Manga.model_validate(db_manga)

    @staticmethod
    def delete(db: Session, manga_id: int) -> Optional[Manga]:
        db_manga = db.query(MangaModel).filter(MangaModel.id == manga_id).first()
        if not db_manga:
            raise RepositoryError("Manga not found")
        # Remove the cover image file if it exists.
        if db_manga.cover_image is not None:
            cover_path = os.path.join(
                settings.IMAGE_SAVE_PATH, str(db_manga.cover_image)
            )
            if os.path.exists(cover_path):
                try:
                    os.remove(cover_path)
                except Exception as e:
                    logger.warning("Failed to remove cover image file: %s", e)
        db.delete(db_manga)
        BaseRepository.commit_session(db)
        return Manga.model_validate(db_manga)

    @staticmethod
    def get_by_genre(db: Session, genre_id: int) -> TypedList[Manga]:
        mangas = (
            db.query(MangaModel)
            .join(GenreModel, MangaModel.genres)
            .filter(GenreModel.id == genre_id)
            .all()
        )
        return [Manga.model_validate(manga) for manga in mangas]

    @staticmethod
    def get_by_author(db: Session, author_id: int) -> TypedList[Manga]:
        mangas = (
            db.query(MangaModel)
            .join(AuthorModel, MangaModel.authors)
            .filter(AuthorModel.id == author_id)
            .all()
        )
        return [Manga.model_validate(manga) for manga in mangas]

    @staticmethod
    def get_by_list(db: Session, list_id: int) -> TypedList[Manga]:
        mangas = (
            db.query(MangaModel)
            .join(ListModel, MangaModel.lists)
            .filter(ListModel.id == list_id)
            .all()
        )
        return [Manga.model_validate(manga) for manga in mangas]

    @staticmethod
    def get_by_star_rating(db: Session, rating: float) -> TypedList[Manga]:
        mangas = db.query(MangaModel).filter(MangaModel.star_rating == rating).all()
        return [Manga.model_validate(manga) for manga in mangas]

    @staticmethod
    def _handle_cover_image(cover_image_url: Optional[str]) -> Optional[str]:
        if not cover_image_url:
            return None
            
        # If it's a URL (from Mangapassion), download it
        if cover_image_url.startswith(('http://', 'https://')):
            unique_id = str(uuid.uuid4())
            filename = f"{unique_id}.jpg"
            save_path = os.path.join(settings.IMAGE_SAVE_PATH, filename)
            os.makedirs(settings.IMAGE_SAVE_PATH, exist_ok=True)
            try:
                response = requests.get(cover_image_url)
                response.raise_for_status()
                with open(save_path, "wb") as f:
                    f.write(response.content)
                return filename
            except Exception as e:
                logger.warning("Failed to download cover image: %s", e)
                return None
        # If it's a filename (from direct upload), just return it
        else:
            return cover_image_url
