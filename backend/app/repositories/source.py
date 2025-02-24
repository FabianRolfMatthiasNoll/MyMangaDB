from typing import List as TypedList, Optional
from sqlalchemy.orm import Session
from backend.app.models import Source as SourceModel
from backend.app.schemas import Source, SourceCreate
from .base import BaseRepository, RepositoryError


class SourceRepository:
    @staticmethod
    def get_all(db: Session) -> TypedList[Source]:
        sources = db.query(SourceModel).all()
        return [Source.model_validate(source) for source in sources]

    @staticmethod
    def get_by_name(db: Session, name: str) -> Optional[Source]:
        source = db.query(SourceModel).filter(SourceModel.name == name).first()
        return Source.model_validate(source) if source else None

    @staticmethod
    def create(db: Session, source_create: SourceCreate) -> Source:
        if db.query(SourceModel).filter(SourceModel.name == source_create.name).first():
            raise RepositoryError(f"Source '{source_create.name}' already exists")
        new_source = SourceModel(**source_create.model_dump())
        db.add(new_source)
        BaseRepository.commit_session(db)
        db.refresh(new_source)
        return Source.model_validate(new_source)
