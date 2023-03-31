from typing import Union

from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
from models import Author, Role


def get_author(db: Session, author_name: str):
    result: Union[models.Author, None] = db.query(models.Author).filter(models.Author.name == author_name).one_or_none()
    return result


def create_author(db: Session, author_name: str) -> Author:
    author = models.Author()
    author.name = author_name

    db.add(author)
    db.commit()
    db.refresh(author)

    return author


def get_role(db: Session, role_name: str) -> Role:
    result: Union[models.Role, None] = db.query(models.Role).filter(models.Role.role == role_name).one_or_none()
    return result


def create_role(db: Session, role_name: str) -> Role:
    role = models.Role()
    role.role = role_name

    db.add(role)
    db.commit()
    db.refresh(role)

    return role


def create_relation(db: Session, author_id: int, manga_id: int, role_id: int):
    relation = models.RelationMangaAuthorRole()
    relation.mangaID = manga_id
    relation.authorID = author_id
    relation.roleID = role_id

    db.add(relation)
    db.commit()


def delete_author(db: Session):
    pass


def get_authors(db: Session):
    pass