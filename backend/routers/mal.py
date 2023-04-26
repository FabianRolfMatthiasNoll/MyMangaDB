from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import crud.mal_api as mal
import crud.manga
from database import get_db
from schema import Manga

router = APIRouter(prefix="/mal", tags=["MyAnimeList"])


@router.get("/{manga_title}")
def get_manga_with_mal(manga_title: str, db: Session = Depends(get_db)) -> Manga:
    result = mal.get_manga_from_mal(manga_title)
    return crud.manga.create_manga(db, result)


@router.get("/search/{manga_title}")
def get_manga_results_with_mal(
    manga_title: str, db: Session = Depends(get_db)
) -> List[Manga]:
    manga_results = mal.get_search_results_from_mal(manga_title)
    return manga_results
