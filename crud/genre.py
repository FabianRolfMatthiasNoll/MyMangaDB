from typing import Union

from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
from models import Genre


def get_genre(db: Session, genre: str) -> Genre:
    result: Union[models.Genre, None] = db.query(models.Genre).filter(models.Genre.name == genre).one_or_none()
    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Genre not found"
        )
    return result


def create_genre(db: Session, genre: str):
    raise HTTPException(
        status_code=501,
        detail="The Developer needed some coffee"
    )