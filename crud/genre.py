from typing import Union, List, Type

from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
from models import Genre


def get_genre(db: Session, genre: str) -> Genre:
    result: Union[models.Genre, None] = db.query(models.Genre).filter(models.Genre.name == genre).one_or_none()
    return result


def get_genre_by_id(db: Session, genre_id: int) -> Genre:
    result: Union[models.Genre, None] = db.query(models.Genre).filter(models.Genre.id == genre_id).one_or_none()
    return result


def get_genres_by_manga_id(db: Session, manga_id: int) -> List[Genre]:
    genres: List[Genre] = []
    result: List[Type[models.RelationMangaGenre]] = db.query(models.RelationMangaGenre).filter(models.RelationMangaGenre.mangaID == manga_id).all()
    for relation in result:
        genre = get_genre_by_id(db, relation.genreID)
        genres.append(genre)
    return genres


def create_genre(db: Session, genre_name: str) -> Genre:
    genre = models.Genre()
    genre.name = genre_name
    db.add(genre)
    db.commit()
    db.refresh(genre)

    return genre


def create_relation(db: Session, genre_id: int, manga_id: int):
    relation = models.RelationMangaGenre()
    relation.mangaID = manga_id
    relation.genreID = genre_id

    db.add(relation)
    db.commit()
