from typing import List
from sqlalchemy.orm import Session
from backend.app.models import Author as AuthorModel
from backend.app.schemas import Author, AuthorCreate


class AuthorRepository:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 10) -> List[Author]:
        authors = db.query(AuthorModel).offset(skip).limit(limit).all()
        return [Author.model_validate(author) for author in authors]

    @staticmethod
    def create(db: Session, author: AuthorCreate) -> Author:
        # Check for duplicate authors by name
        existing_author = (
            db.query(AuthorModel).filter(AuthorModel.name == author.name).first()
        )
        if existing_author:
            raise ValueError(f"Author '{author.name}' already exists")

        try:
            new_author = AuthorModel(**author.model_dump())
            db.add(new_author)
            db.commit()
            db.refresh(new_author)
            return Author.model_validate(new_author)
        except Exception as e:
            db.rollback()
            raise ValueError(f"Failed to create author: {e}")
