from typing import List
from sqlalchemy.orm import Session
from backend.app.models import Genre as GenreModel
from backend.app.schemas import Genre


class GenreRepository:
    @staticmethod
    def get_all(db: Session) -> List[Genre]:
        genres = db.query(GenreModel).all()
        return [Genre.model_validate(genre) for genre in genres]
