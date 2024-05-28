from typing import List
from sqlalchemy.orm import Session
from backend.app.models import Author as AuthorModel
from backend.app.schemas import Author


class AuthorRepository:
    @staticmethod
    def get_all(db: Session) -> List[Author]:
        authors = db.query(AuthorModel).all()
        return [Author.model_validate(author) for author in authors]
