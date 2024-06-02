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
)
from backend.app.repositories.author import AuthorRepository
from backend.app.repositories.genre import GenreRepository
from backend.app.schemas import MangaCreate, Manga
from backend.app import settings


class MangaRepository:
    @staticmethod
    def create(db: Session, manga: MangaCreate) -> Manga:
        authors = []
        for author in manga.authors:
            existing_author = (
                db.query(AuthorModel).filter(AuthorModel.name == author.name).first()
            )
            if existing_author:
                authors.append(existing_author)
            else:
                new_author = AuthorRepository.create(db, author)
                authors.append(new_author)

        genres = []
        for genre in manga.genres:
            existing_genre = (
                db.query(GenreModel).filter(GenreModel.name == genre.name).first()
            )
            if existing_genre:
                genres.append(existing_genre)
            else:
                new_genre = GenreRepository.create(db, genre)
                genres.append(new_genre)

        volumes = [VolumeModel(**volume.model_dump()) for volume in manga.volumes]

        # Download and save the cover image
        cover_image_url = manga.cover_image
        if cover_image_url:
            unique_id = str(uuid.uuid4())
            image_filename = f"{unique_id}.jpg"
            image_save_path = os.path.join(settings.IMAGE_SAVE_PATH, image_filename)

            # Ensure the directory exists
            os.makedirs(settings.IMAGE_SAVE_PATH, exist_ok=True)

            response = requests.get(cover_image_url)
            if response.status_code == 200:
                with open(image_save_path, "wb") as f:
                    f.write(response.content)
            else:
                raise ValueError("Failed to download cover image")
        else:
            image_filename = None

        db_manga = MangaModel(
            title=manga.title,
            japanese_title=manga.japanese_title,
            reading_status=manga.reading_status,
            overall_status=manga.overall_status,
            star_rating=manga.star_rating,
            language=manga.language,
            category=manga.category,
            summary=manga.summary,
            cover_image=image_filename,
            authors=authors,
            genres=genres,
            volumes=volumes,
        )
        db.add(db_manga)
        db.commit()
        db.refresh(db_manga)
        return Manga.model_validate(db_manga)

    @staticmethod
    def create_list(db: Session, mangas: List[MangaCreate]) -> List[Manga]:
        db_mangas = []
        for manga in mangas:
            db_manga = MangaRepository.create(db, manga)
            db_mangas.append(db_manga)
        return db_mangas

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
    def update(db: Session, manga: Manga) -> Manga:
        db_manga = db.query(MangaModel).filter(MangaModel.id == manga.id).first()
        if not db_manga:
            raise ValueError("Manga not found")

        # Update basic fields
        # The download and change of the name will be handled by a different method called from the API
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

        # Update authors
        db_manga.authors.clear()
        for author in manga.authors:
            existing_author = (
                db.query(AuthorModel).filter(AuthorModel.name == author.name).first()
            )
            if existing_author:
                db_manga.authors.append(existing_author)
            else:
                new_author = AuthorModel(name=author.name)
                db.add(new_author)
                db.commit()
                db.refresh(new_author)
                db_manga.authors.append(new_author)

        # Update genres
        db_manga.genres.clear()
        for genre in manga.genres:
            existing_genre = (
                db.query(GenreModel).filter(GenreModel.name == genre.name).first()
            )
            if existing_genre:
                db_manga.genres.append(existing_genre)
            else:
                new_genre = GenreModel(name=genre.name)
                db.add(new_genre)
                db.commit()
                db.refresh(new_genre)
                db_manga.genres.append(new_genre)

        # Update volumes
        db_manga.volumes.clear()
        for volume in manga.volumes:
            new_volume = VolumeModel(**volume.model_dump())
            db_manga.volumes.append(new_volume)

        db.commit()
        db.refresh(db_manga)
        return Manga.model_validate(db_manga)

    @staticmethod
    def delete(db: Session, manga_id: int) -> Optional[Manga]:
        db_manga = db.query(MangaModel).filter(MangaModel.id == manga_id).first()
        if db_manga:
            # Delete the cover image
            cover_image_path = os.path.join(
                str(settings.IMAGE_SAVE_PATH), str(db_manga.cover_image)
            )
            if os.path.exists(cover_image_path):
                os.remove(cover_image_path)
            db.delete(db_manga)
            db.commit()
            return Manga.model_validate(db_manga)
        return None
