from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.crud import jikan_api

from backend.database import get_db
from backend.schema import Manga

router = APIRouter(prefix="/jikan", tags=["Jikan"])


@router.get("/search/{manga_title}")
def get_mangas_with_jikan(
    manga_title: str, db: Session = Depends(get_db)
) -> List[Manga]:
    manga_results = jikan_api.get_search_results_from_jikan(manga_title)
    return manga_results
