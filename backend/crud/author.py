from typing import Union, List

from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
import schema
from models import Author, Role


def get_author(db: Session, author_name: str):
    result: Union[models.Author, None] = db.query(models.Author).filter(
        models.Author.name == author_name).one_or_none()
    return result


def get_author_by_id(db: Session, author_id: int):
    result: Union[models.Author, None] = db.query(models.Author).filter(
        models.Author.id == author_id).one_or_none()
    return result


def get_authors_by_manga_id(db: Session, manga_id: int) -> List[schema.Author]:
    relations = get_relations_by_manga_id(db, manga_id)
    authors: List[schema.Author] = []
    for relation in relations:
        author = get_author_by_id(db, relation.authorID)
        if author is None:
            raise HTTPException(
                status_code=404,
                detail="Related Author not found"
            )
        role = get_role_by_id(db, relation.roleID)
        if role is None:
            raise HTTPException(
                status_code=404,
                detail="Related Role not found"
            )
        author_data = {"name": author.name, "role": role.name}
        author_model = schema.Author(**author_data)
        authors.append(author_model)
    return authors


def create_author(db: Session, author_name: str) -> Author:
    author = models.Author()
    author.name = author_name

    db.add(author)
    db.commit()
    db.refresh(author)

    return author


def get_role(db: Session, role_name: str) -> Role:
    result: Union[models.Role, None] = db.query(models.Role).filter(
        models.Role.name == role_name).one_or_none()
    return result


def get_role_by_id(db: Session, role_id: int):
    result: Union[models.Role, None] = db.query(
        models.Role).filter(models.Role.id == role_id).one_or_none()
    return result


def create_role(db: Session, role_name: str) -> Role:
    role = models.Role()
    role.name = role_name

    db.add(role)
    db.commit()
    db.refresh(role)

    return role


def get_relations_by_manga_id(db: Session, manga_id: int):
    result: List[models.RelationMangaAuthorRole, None] = db.query(models.RelationMangaAuthorRole) \
        .filter(models.RelationMangaAuthorRole.mangaID == manga_id).all()
    return result


def get_relations_by_author_id(db: Session, author_id: int):
    result: List[models.RelationMangaAuthorRole, None] = db.query(models.RelationMangaAuthorRole) \
        .filter(models.RelationMangaAuthorRole.authorID == author_id).all()
    return result


def create_relation(db: Session, author_id: int, manga_id: int, role_id: int):
    relation = models.RelationMangaAuthorRole()
    relation.mangaID = manga_id
    relation.authorID = author_id
    relation.roleID = role_id

    db.add(relation)
    db.commit()
