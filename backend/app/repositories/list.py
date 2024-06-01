from typing import List
from sqlalchemy.orm import Session

from backend.app.schemas import ListCreate, ListModel
from backend.app.models import List as DBList


class ListRepository:
    @staticmethod
    def create(db: Session, list: ListCreate) -> ListModel:
        db_list = DBList(name=list.name)
        db.add(db_list)
        db.commit()
        db.refresh(db_list)
        return ListModel.model_validate(db_list)

    @staticmethod
    def get_all(db: Session) -> List[ListModel]:
        return [ListModel.model_validate(list) for list in db.query(DBList).all()]
