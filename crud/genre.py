from typing import Union

from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
from models import Genre


def get_genre(db: Session, genre: str) -> Genre:
    result: Union[models.Genre, None] = db.query(models.Genre).filter(models.Genre.name == genre).one_or_none()
    return result


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


def get_relations_by_manga(db: Session, manga_id: int):
    raise HTTPException(
        status_code=501,
        detail="The Developer needed some coffee"
    )


def get_relations_by_genre(db: Session, genre_id: int):
    raise HTTPException(
        status_code=501,
        detail="The Developer needed some coffee"
    )