from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.models import Author as AuthorModel
from backend.app.schemas import Author, AuthorCreate
from .base import BaseRepository, RepositoryError


class AuthorRepository:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 10) -> List[Author]:
        authors = db.query(AuthorModel).offset(skip).limit(limit).all()
        return [Author.model_validate(author) for author in authors]

    @staticmethod
    def get_by_id(db: Session, author_id: int) -> Optional[Author]:
        author = db.query(AuthorModel).filter(AuthorModel.id == author_id).first()
        return Author.model_validate(author) if author else None

    @staticmethod
    def create(db: Session, author: AuthorCreate) -> Author:
        existing = db.query(AuthorModel).filter(AuthorModel.name == author.name).first()
        if existing:
            raise RepositoryError(f"Author '{author.name}' already exists")
        new_author = AuthorModel(**author.model_dump())
        db.add(new_author)
        BaseRepository.commit_session(db)
        db.refresh(new_author)
        return Author.model_validate(new_author)
