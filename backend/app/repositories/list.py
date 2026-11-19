from typing import List as TypedList
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.app.models import List as ListModel
from backend.app.models import manga_list
from backend.app.schemas import ListCreate
from backend.app.schemas import ListModel as ListSchema

from .base import BaseRepository, RepositoryError


class ListRepository:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 10) -> TypedList[ListSchema]:
        lists_ = db.query(ListModel).offset(skip).limit(limit).all()
        return [ListSchema.model_validate(item) for item in lists_]

    @staticmethod
    def get_by_id(db: Session, list_id: int) -> Optional[ListSchema]:
        list_ = db.query(ListModel).filter(ListModel.id == list_id).first()
        return ListSchema.model_validate(list_) if list_ else None

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

    @staticmethod
    def update(db: Session, list_id: int, list_data: ListCreate) -> ListSchema:
        list_ = db.query(ListModel).filter(ListModel.id == list_id).first()
        if not list_:
            raise RepositoryError("List not found")

        # Check if the new name conflicts with an existing list
        existing = (
            db.query(ListModel)
            .filter(ListModel.name == list_data.name, ListModel.id != list_id)
            .first()
        )
        if existing:
            raise RepositoryError(f"List '{list_data.name}' already exists")

        list_.name = list_data.name
        BaseRepository.commit_session(db)
        db.refresh(list_)
        return ListSchema.model_validate(list_)

    @staticmethod
    def delete(db: Session, list_id: int) -> Optional[ListSchema]:
        list_ = db.query(ListModel).filter(ListModel.id == list_id).first()
        if not list_:
            raise RepositoryError("List not found")
        db.delete(list_)
        BaseRepository.commit_session(db)
        return ListSchema.model_validate(list_)

    @staticmethod
    def get_with_manga_count(db: Session) -> TypedList[dict]:
        """Return every list together with the number of manga it holds.

        The counts are aggregated in a single query. Touching ``list_.mangas``
        instead would emit one extra SELECT per list, which is an N+1 that
        gets expensive as the number of lists grows.
        """
        counts = (
            db.query(
                manga_list.c.list_id,
                func.count(manga_list.c.manga_id).label("manga_count"),
            )
            .group_by(manga_list.c.list_id)
            .subquery()
        )

        rows = (
            db.query(
                ListModel.id,
                ListModel.name,
                func.coalesce(counts.c.manga_count, 0),
            )
            .outerjoin(counts, counts.c.list_id == ListModel.id)
            .order_by(ListModel.id)
            .all()
        )

        return [
            {"id": list_id, "name": name, "mangaCount": manga_count}
            for list_id, name, manga_count in rows
        ]
