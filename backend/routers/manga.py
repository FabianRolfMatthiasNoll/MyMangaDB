from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud.author as authorManager
import crud.genre as genreManager
import crud.volume as volumeManager
import crud.manga as mangaManager

from database import get_db
from schema import Manga, Volume
from models import Manga as DBManga

router = APIRouter(prefix="/manga", tags=["Manga"])

# TODO: Try to fetch cover images for mangas

# TODO: Will be for now withold until it is certain that these features are needed:
# Remove Author endpoint
# Remove Genre endpoint


@router.get("/")
def get_all_mangas(db: Session = Depends(get_db)) -> List[Manga]:
    db_mangas = db.query(DBManga).all()
    mangas = []
    for db_manga in db_mangas:
        mangas.append(mangaManager.create_manga_model(db, db_manga))
    return mangas


@router.get("/id/{manga_id}")
def get_manga_by_id(manga_id: int, db: Session = Depends(get_db)) -> Manga:
    db_manga = db.query(DBManga).filter(DBManga.id == manga_id).one_or_none()
    if db_manga is None:
        raise HTTPException(status_code=404, detail="Manga id not found")
    return mangaManager.create_manga_model(db, db_manga)


@router.get("/title/{manga_title}")
def get_manga_by_title(manga_title: str, db: Session = Depends(get_db)) -> Manga:
    manga = mangaManager.get_manga_by_title(db, manga_title)
    if manga is None:
        raise HTTPException(status_code=404, detail="Manga title not found")
    return mangaManager.create_manga_model(db, manga)


@router.get("/genre/{genre_name}")
def get_mangas_by_genre(genre_name: str, db: Session = Depends(get_db)) -> List[Manga]:
    genre = genreManager.get_genre(db, genre_name)
    if genre is None:
        raise HTTPException(status_code=404, detail="Genre not found")
    relations = genreManager.get_relations_by_genre_id(db, genre.id)
    return mangaManager.get_mangas_by_relations(db, relations)


@router.get("/author/{author_name}")
def get_mangas_by_author(
    author_name: str, db: Session = Depends(get_db)
) -> List[Manga]:
    author = authorManager.get_author(db, author_name)
    if author is None:
        raise HTTPException(status_code=404, detail="Author not found")
    relations = authorManager.get_relations_by_author_id(db, author.id)
    return mangaManager.get_mangas_by_relations(db, relations)


@router.post("/")
def create_manga(manga: Manga, db: Session = Depends(get_db)) -> Manga:
    return mangaManager.create_manga(db, manga)


@router.post("/add_vol")
def add_volume(volume: Volume, db: Session = Depends(get_db)) -> Manga:
    existing_volumes = volumeManager.get_volumes_by_manga_id(db, volume.manga_id)
    for existing_volume in existing_volumes:
        if existing_volume.volume_num == volume.volume_num:
            raise HTTPException(status_code=404, detail="Volume already existing")

    volumeManager.create_volume(db, volume)

    return get_manga_by_id(volume.manga_id, db)


@router.delete("/del_vol")
def remove_volume(volume_id: int, db: Session = Depends(get_db)):
    volumeManager.delete_volume(db, volume_id)


@router.put("/update_manga")
def update_manga(manga: Manga, db: Session = Depends(get_db)) -> Manga:
    return mangaManager.update_manga(db, manga)


@router.delete("/remove")
def remove_manga(manga_id: int, db: Session = Depends(get_db)):
    mangaManager.remove_manga(db, manga_id)
