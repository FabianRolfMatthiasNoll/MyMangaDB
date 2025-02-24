from typing import List as TypedList
from sqlalchemy.orm import Session
from backend.app.models import List as ListModel
from backend.app.schemas import ListCreate, ListModel as ListSchema
from .base import BaseRepository, RepositoryError


class ListRepository:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 10) -> TypedList[ListSchema]:
        lists_ = db.query(ListModel).offset(skip).limit(limit).all()
        return [ListSchema.model_validate(item) for item in lists_]

    @staticmethod
    def create(db: Session, list_create: ListCreate) -> ListSchema:
        existing = (
            db.query(ListModel).filter(ListModel.name == list_create.name).first()
        )
        if existing:
            raise RepositoryError(f"List '{list_create.name}' already exists")
        new_list = ListModel(name=list_create.name)
        db.add(new_list)
        BaseRepository.commit_session(db)
        db.refresh(new_list)
        return ListSchema.model_validate(new_list)
