from typing import List, Optional
from sqlalchemy.orm import Session
import os
import uuid
import requests
from backend.app.models import (
    Manga as MangaModel,
    Author as AuthorModel,
    Genre as GenreModel,
    Volume as VolumeModel,
    List as ListModel,
)
from backend.app.schemas import MangaCreate, Manga
from backend.app import settings


class MangaRepository:
    @staticmethod
    def find_or_create(db: Session, model, field, value):
        existing_item = db.query(model).filter(field == value).first()
        if existing_item:
            return existing_item
        new_item = model(**value.model_dump())
        db.add(new_item)
        db.flush()  # Delayed commit to avoid multiple commits
        return new_item

    @staticmethod
    def create(db: Session, manga: MangaCreate) -> Manga:
        # Check for duplicate Manga before starting
        existing_manga = (
            db.query(MangaModel).filter(MangaModel.title == manga.title).first()
        )
        if existing_manga:
            raise ValueError(f"Manga '{manga.title}' already exists")

        try:
            # Process authors
            authors = [
                MangaRepository.find_or_create(
                    db, AuthorModel, AuthorModel.name, author
                )
                for author in manga.authors
            ]

            # Process genres
            genres = [
                MangaRepository.find_or_create(db, GenreModel, GenreModel.name, genre)
                for genre in manga.genres
            ]

            # Process volumes
            volumes = [VolumeModel(**volume.model_dump()) for volume in manga.volumes]

            # Process lists
            lists = [
                MangaRepository.find_or_create(db, ListModel, ListModel.name, list_item)
                for list_item in manga.lists
            ]

            # Download and save the cover image
            cover_image_filename = MangaRepository._download_cover_image(
                manga.cover_image or ""
            )

            db_manga = MangaModel(
                title=manga.title,
                japanese_title=manga.japanese_title,
                reading_status=manga.reading_status,
                overall_status=manga.overall_status,
                star_rating=manga.star_rating,
                language=manga.language,
                category=manga.category,
                summary=manga.summary,
                cover_image=cover_image_filename,
                lists=lists,
                authors=authors,
                genres=genres,
                volumes=volumes,
            )
            db.add(db_manga)
            db.commit()  # Only one commit at the end
            db.refresh(db_manga)

            return Manga.model_validate(db_manga)

        except Exception as e:
            db.rollback()  # Ensure rollback on failure
            raise ValueError(f"Failed to create manga: {e}")

    @staticmethod
    def _download_cover_image(cover_image_url: str) -> Optional[str]:
        if not cover_image_url:
            return None

        unique_id = str(uuid.uuid4())
        image_filename = f"{unique_id}.jpg"
        image_save_path = os.path.join(settings.IMAGE_SAVE_PATH, image_filename)

        os.makedirs(settings.IMAGE_SAVE_PATH, exist_ok=True)

        response = requests.get(cover_image_url)
        if response.status_code == 200:
            with open(image_save_path, "wb") as f:
                f.write(response.content)
            return image_filename
        else:
            raise ValueError("Failed to download cover image")

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
    def create_list(db: Session, mangas: List[MangaCreate]) -> List[Manga]:
        db_mangas = []
        try:
            for manga in mangas:
                db_manga = MangaRepository.create(db, manga)
                db_mangas.append(db_manga)
            return db_mangas
        except Exception as e:
            db.rollback()
            raise ValueError(f"Failed to create manga list: {e}")

    @staticmethod
    def update(db: Session, manga: Manga) -> Manga:
        db_manga = db.query(MangaModel).filter(MangaModel.id == manga.id).first()
        if not db_manga:
            raise ValueError("Manga not found")

        # Update fields
        fields_to_update = [
            "title",
            "japanese_title",
            "reading_status",
            "overall_status",
            "star_rating",
            "language",
            "category",
            "summary",
            "cover_image",
        ]
        for field in fields_to_update:
            setattr(db_manga, field, getattr(manga, field))

        # Update related objects (authors, genres, volumes, lists)
        db_manga.authors = [
            MangaRepository.find_or_create(db, AuthorModel, AuthorModel.name, author)
            for author in manga.authors
        ]

        db_manga.genres = [
            MangaRepository.find_or_create(db, GenreModel, GenreModel.name, genre)
            for genre in manga.genres
        ]

        db_manga.volumes = [
            VolumeModel(**volume.model_dump()) for volume in manga.volumes
        ]

        db_manga.lists = [
            MangaRepository.find_or_create(db, ListModel, ListModel.name, list_item)
            for list_item in manga.lists
        ]

        db.commit()
        db.refresh(db_manga)
        return Manga.model_validate(db_manga)

    @staticmethod
    def delete(db: Session, manga_id: int) -> Optional[Manga]:
        db_manga = db.query(MangaModel).filter(MangaModel.id == manga_id).first()
        if db_manga:
            # Delete cover image
            cover_image_path = os.path.join(
                str(settings.IMAGE_SAVE_PATH), str(db_manga.cover_image)
            )
            if os.path.exists(cover_image_path):
                os.remove(cover_image_path)
            db.delete(db_manga)
            db.commit()
            return Manga.model_validate(db_manga)
        return None
