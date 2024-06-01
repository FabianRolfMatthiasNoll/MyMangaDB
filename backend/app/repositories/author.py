from typing import List
from sqlalchemy.orm import Session
from backend.app.models import Author as AuthorModel
from backend.app.schemas import Author, AuthorCreate


class AuthorRepository:
    @staticmethod
    def get_all(db: Session) -> List[Author]:
        authors = db.query(AuthorModel).all()
        return [Author.model_validate(author) for author in authors]

    @staticmethod
    def create(db: Session, author: AuthorCreate) -> Author:
        new_author = AuthorModel(**author.model_dump())
        db.add(new_author)
        db.commit()
        db.refresh(new_author)
        return Author.model_validate(new_author)
