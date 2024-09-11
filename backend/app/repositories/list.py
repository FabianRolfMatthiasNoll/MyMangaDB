from typing import List
from sqlalchemy.orm import Session
from backend.app.schemas import ListCreate, ListModel
from backend.app.models import List as DBList


class ListRepository:
    @staticmethod
    def create(db: Session, list: ListCreate) -> ListModel:
        # Check for duplicate list
        existing_list = db.query(DBList).filter(DBList.name == list.name).first()
        if existing_list:
            raise ValueError(f"List '{list.name}' already exists")

        try:
            db_list = DBList(name=list.name)
            db.add(db_list)
            db.commit()
            db.refresh(db_list)
            return ListModel.model_validate(db_list)
        except Exception as e:
            db.rollback()
            raise ValueError(f"Failed to create list: {e}")

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 10) -> List[ListModel]:
        lists = db.query(DBList).offset(skip).limit(limit).all()
        return [ListModel.model_validate(list) for list in lists]
