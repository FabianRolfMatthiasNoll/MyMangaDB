from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import crud.mal_api as mal
import crud.manga
from backend import schema
from backend.database import get_db

router = APIRouter(prefix="/mal", tags=["MyAnimeList"])


@router.get("/{manga_title}")
def get_manga_with_mal(manga_title: str, db: Session = Depends(get_db)) -> schema.Manga:
    result = mal.get_manga_from_mal(manga_title)
    return crud.manga.create_manga(db, result)
