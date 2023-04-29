from typing import Union, List, Type

from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
from models import Genre as DBGenre
from models import RelationMangaGenre as Relation


def get_genre(db: Session, genre: str) -> DBGenre:
    result: Union[DBGenre, None] = (
        db.query(DBGenre).filter(DBGenre.name == genre).one_or_none()
    )
    return result


def get_genre_by_id(db: Session, genre_id: int) -> DBGenre:
    result: Union[DBGenre, None] = (
        db.query(DBGenre).filter(DBGenre.id == genre_id).one_or_none()
    )
    return result


def get_genres_by_manga_id(db: Session, manga_id: int) -> List[DBGenre]:
    genres: List[DBGenre] = []
    result: List[Relation] = get_relations_by_manga_id(db, manga_id)
    for relation in result:
        genre = get_genre_by_id(db, relation.genreID)
        genres.append(genre)
    return genres


def create_genre(db: Session, genre_name: str) -> DBGenre:
    genre = DBGenre()
    genre.name = genre_name
    db.add(genre)
    db.commit()
    db.refresh(genre)

    return genre


def create_relation(db: Session, genre_id: int, manga_id: int):
    relation = Relation()
    relation.mangaID = manga_id
    relation.genreID = genre_id

    db.add(relation)
    db.commit()


def get_relations_by_genre_id(db: Session, genre_id: int) -> List[Relation]:
    result: List[Relation] = (
        db.query(Relation).filter(Relation.genreID == genre_id).all()
    )
    return result


def get_relations_by_manga_id(db: Session, manga_id: int) -> List[Relation]:
    result: List[Relation] = (
        db.query(Relation).filter(Relation.mangaID == manga_id).all()
    )
    return result


def delete_relation(db: Session, genre_id: int, manga_id: int):
    db.query(Relation).filter(
        Relation.authorID == genre_id and Relation.manga_id == manga_id
    ).delete()
    db.commit()


def delete_relations_by_manga_id(db: Session, manga_id: int):
    db.query(Relation).filter(Relation.mangaID == manga_id).delete()
    db.commit()


def update_relations(db: Session, genres: List[DBGenre], manga_id: int):
    delete_relations_by_manga_id(db, manga_id)
    for genre in genres:
        result_genre = get_genre(db, genre.name)
        if result_genre is None:
            result_genre = create_genre(db, genre.name)
        # when creating manga there can be not relations, so we just have to create it.
        create_relation(db, result_genre.id, manga_id)
    db.commit()
