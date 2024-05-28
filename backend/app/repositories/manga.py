from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.models import Manga as MangaModel
from backend.app.schemas import MangaCreate, Manga


class MangaRepository:
    @staticmethod
    def create(db: Session, manga: MangaCreate) -> Manga:
        # TODO: dict is deprecated
        db_manga = MangaModel(**manga.model_dump())
        db.add(db_manga)
        db.commit()
        db.refresh(db_manga)
        return Manga.model_validate(db_manga)

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 10) -> List[Manga]:
        db_mangas = db.query(MangaModel).offset(skip).limit(limit).all()
        return [Manga.model_validate(db_manga) for db_manga in db_mangas]

    @staticmethod
    def get_by_id(db: Session, manga_id: int) -> Optional[Manga]:
        db_manga = db.query(MangaModel).filter(MangaModel.id == manga_id).first()
        if db_manga:
            return Manga.model_validate(db_manga)
        return None

    @staticmethod
    def update(db: Session, manga_id: int, manga: MangaCreate) -> Manga:
        db_manga = db.query(MangaModel).filter(MangaModel.id == manga_id).first()
        for key, value in manga.dict(exclude_unset=True).items():
            setattr(db_manga, key, value)
        db.commit()
        db.refresh(db_manga)
        return Manga.model_validate(db_manga)

    @staticmethod
    def delete(db: Session, manga_id: int) -> Optional[Manga]:
        db_manga = db.query(MangaModel).filter(MangaModel.id == manga_id).first()
        if db_manga:
            db.delete(db_manga)
            db.commit()
            return Manga.model_validate(db_manga)
        return None
