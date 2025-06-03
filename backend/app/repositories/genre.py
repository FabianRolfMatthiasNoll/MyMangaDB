from typing import List
from sqlalchemy.orm import Session
from backend.app.models import Genre as GenreModel
from backend.app.schemas import Genre, GenreCreate
from .base import BaseRepository, RepositoryError

class GenreRepository:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 10) -> List[Genre]:
        genres = db.query(GenreModel).offset(skip).limit(limit).all()
        return [Genre.model_validate(genre) for genre in genres]

    @staticmethod
    def create(db: Session, genre: GenreCreate) -> Genre:
        existing = db.query(GenreModel).filter(GenreModel.name == genre.name).first()
        if existing:
            raise RepositoryError(f"Genre '{genre.name}' already exists")
        new_genre = GenreModel(**genre.model_dump())
        db.add(new_genre)
        BaseRepository.commit_session(db)
        db.refresh(new_genre)
        return Genre.model_validate(new_genre)
