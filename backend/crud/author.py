from typing import Union, List

from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
from schema import Manga, Author
from models import Role as DBRole
from models import Author as DBAuthor
from models import RelationMangaAuthorRole as Relation


def get_author(db: Session, author_name: str):
    result: Union[models.Author, None] = (
        db.query(models.Author).filter(models.Author.name == author_name).one_or_none()
    )
    return result


def get_author_by_id(db: Session, author_id: int):
    result: Union[models.Author, None] = (
        db.query(models.Author).filter(models.Author.id == author_id).one_or_none()
    )
    return result


def get_authors_by_manga_id(db: Session, manga_id: int) -> List[Author]:
    relations = get_relations_by_manga_id(db, manga_id)
    authors: List[Author] = []
    for relation in relations:
        author = get_author_by_id(db, relation.authorID)
        if author is None:
            raise HTTPException(status_code=404, detail="Related Author not found")
        role = get_role_by_id(db, relation.roleID)
        if role is None:
            raise HTTPException(status_code=404, detail="Related Role not found")
        author_data = {"id": author.id, "name": author.name, "role": role.name}
        author_model = Author(**author_data)
        authors.append(author_model)
    return authors


def create_author(db: Session, author_name: str) -> Author:
    author = DBAuthor()
    author.name = author_name

    db.add(author)
    db.commit()
    db.refresh(author)

    return author


def get_role(db: Session, role_name: str) -> DBRole:
    result: Union[DBRole, None] = (
        db.query(DBRole).filter(DBRole.name == role_name).one_or_none()
    )
    return result


def get_role_by_id(db: Session, role_id: int):
    result: Union[DBRole, None] = (
        db.query(DBRole).filter(DBRole.id == role_id).one_or_none()
    )
    return result


def create_role(db: Session, role_name: str) -> DBRole:
    role = DBRole()
    role.name = role_name

    db.add(role)
    db.commit()
    db.refresh(role)

    return role


def get_relations_by_manga_id(db: Session, manga_id: int):
    result: List[Relation, None] = (
        db.query(Relation).filter(Relation.mangaID == manga_id).all()
    )
    return result


def get_relations_by_author_id(db: Session, author_id: int):
    result: List[Relation, None] = (
        db.query(Relation).filter(Relation.authorID == author_id).all()
    )
    return result


def create_relation(db: Session, author_id: int, manga_id: int, role_id: int):
    relation = Relation()
    relation.mangaID = manga_id
    relation.authorID = author_id
    relation.roleID = role_id

    db.add(relation)
    db.commit()


def delete_relation(db: Session, author_id: int, manga_id: int):
    db.query(Relation).filter(
        Relation.authorID == author_id and Relation.manga_id == manga_id
    ).delete()
    db.commit()


def delete_relations_by_manga_id(db: Session, manga_id: int):
    db.query(Relation).filter(Relation.mangaID == manga_id).delete()
    db.commit()


def update_relations(db: Session, authors: List[Author], manga_id: int):
    delete_relations_by_manga_id(db, manga_id)
    for author in authors:
        result_author = get_author(db, author.name)
        if result_author is None:
            result_author = create_author(db, author.name)
        result_role = get_role(db, author.role)
        if result_role is None:
            result_role = create_role(db, author.role)
        create_relation(db, result_author.id, manga_id, result_role.id)
    db.commit()
