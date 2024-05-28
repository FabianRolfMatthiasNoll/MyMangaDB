from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.models import Source as SourceModel
from backend.app.schemas import SourceCreate, Source


class SourceRepository:
    @staticmethod
    def create(db: Session, source: SourceCreate) -> Source:
        db_source = SourceModel(**source.model_dump())
        db.add(db_source)
        db.commit()
        db.refresh(db_source)
        return Source.model_validate(db_source)

    @staticmethod
    def get_all(db: Session) -> List[Source]:
        db_sources = db.query(SourceModel).all()
        return [Source.model_validate(db_source) for db_source in db_sources]

    @staticmethod
    def get_by_id(db: Session, source_id: int) -> Optional[Source]:
        db_source = db.query(SourceModel).filter(SourceModel.id == source_id).first()
        if db_source:
            return Source.model_validate(db_source)
        return None

    @staticmethod
    def get_by_name(db: Session, name: str) -> Optional[Source]:
        db_source = db.query(SourceModel).filter(SourceModel.name == name).first()
        if db_source:
            return Source.model_validate(db_source)
        return None
