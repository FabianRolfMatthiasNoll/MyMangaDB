from typing import List, Union

from fastapi import HTTPException
from sqlalchemy.orm import Session

import crud.author as authorManager
import crud.genre as genreManager
import crud.volume as volumeManager
import crud.manga as mangaManager

from models import Manga as DBManga
from schema import Manga as Manga


def create_manga_model(db: Session, db_manga: DBManga) -> Manga:
    manga = Manga(
        id=db_manga.id,
        title=db_manga.title,
        description=db_manga.description,
        volumes=volumeManager.get_volumes_by_manga_id(db, db_manga.id),
        total_volumes=db_manga.total_volumes,
        authors=authorManager.get_authors_by_manga_id(db, db_manga.id),
        genres=genreManager.get_genres_by_manga_id(db, db_manga.id),
        cover_image=db_manga.cover_image,
        reading_status=db_manga.reading_status,
        collection_status=db_manga.collection_status,
    )
    return manga


def create_manga(db: Session, manga: Manga) -> Manga:
    exists = db.query(db.query(DBManga).filter_by(title=manga.title).exists()).scalar()
    if exists:
        raise HTTPException(status_code=400, detail="Manga already exists")
    db_manga = DBManga()
    db_manga.title = manga.title
    db_manga.description = manga.description
    db_manga.totalVolumes = manga.total_volumes
    db_manga.cover_image = manga.cover_image
    db_manga.reading_status = manga.reading_status
    db_manga.collection_status = manga.collection_status
    db.add(db_manga)
    db.commit()
    db.refresh(db_manga)
    for genre in manga.genres:
        result_genre = genreManager.get_genre(db, genre.name)
        if result_genre is None:
            result_genre = genreManager.create_genre(db, genre.name)
        # when creating manga there can be not relations, so we just have to create it.
        genreManager.create_relation(db, result_genre.id, db_manga.id)
    for author in manga.authors:
        result_author = authorManager.get_author(db, author.name)
        if result_author is None:
            result_author = authorManager.create_author(db, author.name)
        result_role = authorManager.get_role(db, author.role)
        if result_role is None:
            result_role = authorManager.create_role(db, author.role)
        authorManager.create_relation(db, result_author.id, db_manga.id, result_role.id)
    return manga


def get_mangas_by_relations(db: Session, relations) -> List[DBManga]:
    mangas = []
    for relation in relations:
        db_manga = (
            db.query(DBManga).filter(DBManga.id == relation.mangaID).one_or_none()
        )
        if db_manga is None:
            raise HTTPException(status_code=404, detail="Manga id not found")
        mangas.append(create_manga_model(db, db_manga))
    return mangas


def get_manga_by_title(db: Session, manga_title: str) -> DBManga:
    manga: Union[DBManga, None] = (
        db.query(DBManga).filter(DBManga.title == manga_title).one_or_none()
    )
    return manga


def update_manga(db: Session, manga: Manga) -> Manga:
    db_manga: Union[DBManga, None] = (
        db.query(DBManga).filter(DBManga.id == manga.id).one_or_none()
    )

    db_manga.title = manga.title
    db_manga.description = manga.description
    db_manga.cover_image = manga.cover_image
    db_manga.total_volumes = manga.total_volumes
    db_manga.reading_status = manga.reading_status
    db_manga.collection_status = manga.collection_status

    db.commit()
    db.refresh(db_manga)

    authorManager.update_relations(db, manga.authors, manga.id)

    genreManager.update_relations(db, manga.genres, manga.id)

    return manga


def remove_manga(db: Session, manga_id: int):
    db.query(DBManga).filter(DBManga.id == manga_id).delete()
    authorManager.delete_relations_by_manga_id(db, manga_id)
    genreManager.delete_relations_by_manga_id(db, manga_id)
    volumeManager.delete_volumes_by_manga(db, manga_id)
    db.commit()
