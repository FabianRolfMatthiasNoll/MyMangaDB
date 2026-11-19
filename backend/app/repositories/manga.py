import logging
import os
import uuid
from typing import List as TypedList
from typing import Optional

from sqlalchemy import asc, desc, or_
from sqlalchemy.orm import Session

from backend.app import settings
from backend.app.core.remote_images import download_public_image
from backend.app.models import Author as AuthorModel
from backend.app.models import Genre as GenreModel
from backend.app.models import List as ListModel
from backend.app.models import Manga as MangaModel
from backend.app.models import Volume as VolumeModel
from backend.app.schemas import Manga, MangaCreate

from .base import BaseRepository, RepositoryError

logger = logging.getLogger(__name__)


class MangaRepository(BaseRepository):
    @staticmethod
    def get_by_title(
        db: Session, title: str, language: Optional[str] = None
    ) -> Optional[Manga]:
        query = db.query(MangaModel).filter(MangaModel.title == title)
        if language:
            query = query.filter(MangaModel.language == language)
        manga = query.first()
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
        categories: Optional[TypedList[str]] = None,
        reading_statuses: Optional[TypedList[str]] = None,
        overall_statuses: Optional[TypedList[str]] = None,
        rating_min: Optional[float] = None,
        rating_max: Optional[float] = None,
        list_id: Optional[int] = None,
        ownership_statuses: Optional[TypedList[str]] = None,
    ) -> TypedList[Manga]:
        """
        Holt Mangas mit Paging.
        Optional: Filter nach Titel (ILIKE '%search%'),
        Kategorie, Reading Status, Overall Status, Rating, Sortierung, Liste,
        Besitzstatus.
        """
        query = db.query(MangaModel)

        # Volltextsuche (case-insensitive) im Titel
        if search:
            ilike_term = f"%{search}%"
            query = query.filter(MangaModel.title.ilike(ilike_term))

        # Filter nach Liste
        if list_id is not None:
            query = query.filter(MangaModel.lists.any(ListModel.id == list_id))

        # Filter by ownership status (owned / wishlist / ordered)
        if ownership_statuses:
            query = query.filter(MangaModel.ownership_status.in_(ownership_statuses))

        # Filter by category
        if categories:
            query = query.filter(MangaModel.category.in_(categories))

        # Filter by reading status
        if reading_statuses:
            query = query.filter(MangaModel.reading_status.in_(reading_statuses))

        # Filter by overall status
        if overall_statuses:
            query = query.filter(MangaModel.overall_status.in_(overall_statuses))

        # Filter by rating range. NULL ratings are treated as "any rating
        # is acceptable" so that unrated manga stay visible under the default
        # rating range of [0, 5]. Without this, every imported manga with
        # star_rating IS NULL would be silently hidden by SQL's three-valued
        # logic (NULL >= 0 evaluates to NULL, which fails a WHERE clause).
        if rating_min is not None:
            query = query.filter(
                or_(
                    MangaModel.star_rating.is_(None),
                    MangaModel.star_rating >= rating_min,
                )
            )
        if rating_max is not None:
            query = query.filter(
                or_(
                    MangaModel.star_rating.is_(None),
                    MangaModel.star_rating <= rating_max,
                )
            )

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
        # Check if manga with same title AND language exists
        existing_manga = (
            db.query(MangaModel)
            .filter(
                MangaModel.title == manga_create.title,
                MangaModel.language == manga_create.language,
            )
            .first()
        )

        if existing_manga:
            raise RepositoryError(
                f"Manga '{manga_create.title}' with language "
                f"'{manga_create.language}' already exists"
            )

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
            ownership_status=manga_create.ownership_status,
            priority=manga_create.priority,
            total_volumes=manga_create.total_volumes,
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
                old_cover_path = os.path.join(
                    settings.IMAGE_SAVE_PATH, str(db_manga.cover_image)
                )
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
            "ownership_status",
            "priority",
            "total_volumes",
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

        # Handle volumes update
        # Filter out id=0 (new volumes) to avoid conflicts with persistent instances
        new_volumes = []
        for vol in manga_data.volumes:
            vol_data = vol.model_dump()
            if vol_data.get("id") == 0:
                del vol_data["id"]
            new_volumes.append(VolumeModel(**vol_data))

        db_manga.volumes = new_volumes

        BaseRepository.commit_session(db)
        db.refresh(db_manga)

        return Manga.model_validate(db_manga)

    @staticmethod
    def delete(db: Session, manga_id: int) -> Optional[Manga]:
        db_manga = db.query(MangaModel).filter(MangaModel.id == manga_id).first()
        if not db_manga:
            raise RepositoryError("Manga not found")

        # Store authors and genres for count update
        authors = set(db_manga.authors)
        genres = set(db_manga.genres)

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

        # The counts are derived, so the values loaded before the delete are
        # now stale. Expiring the affected rows makes the next access
        # recompute them.
        for author in authors:
            db.expire(author)
        for genre in genres:
            db.expire(genre)

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
        if cover_image_url.startswith(("http://", "https://")):
            unique_id = str(uuid.uuid4())
            filename = f"{unique_id}.jpg"
            save_path = os.path.join(settings.IMAGE_SAVE_PATH, filename)
            os.makedirs(settings.IMAGE_SAVE_PATH, exist_ok=True)
            try:
                # The URL comes from the request body, so the download has to
                # be restricted to public addresses - otherwise the backend
                # could be pointed at internal services (SSRF).
                content = download_public_image(cover_image_url)
                with open(save_path, "wb") as f:
                    f.write(content)
                return filename
            except Exception as e:
                logger.warning("Failed to download cover image: %s", e)
                return None
        # If it's a filename (from direct upload), just return it
        else:
            return cover_image_url
