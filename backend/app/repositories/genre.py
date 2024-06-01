from typing import List
from sqlalchemy.orm import Session
from backend.app.models import Genre as GenreModel
from backend.app.schemas import Genre, GenreCreate


class GenreRepository:
    @staticmethod
    def get_all(db: Session) -> List[Genre]:
        genres = db.query(GenreModel).all()
        return [Genre.model_validate(genre) for genre in genres]

    @staticmethod
    def create(db: Session, genre: GenreCreate) -> Genre:
        new_genre = GenreModel(**genre.model_dump())
        db.add(new_genre)
        db.commit()
        db.refresh(new_genre)
        return Genre.model_validate(new_genre)
