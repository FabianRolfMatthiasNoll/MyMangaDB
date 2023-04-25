from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud.author
import crud.genre
import crud.volume
import crud.manga

from database import get_db
from schema import Manga, Volume
from models import Manga as DBManga

router = APIRouter(prefix="/manga", tags=["Manga"])


# TODO: add volume by title
# TODO: Add Author by manga id
# TODO: Add Genre by manga id
# TODO: Change Author and / or Role
# TODO: Remove / Edit Genres
# TODO: Remove Volumes


@router.get("/")
def get_all_mangas(db: Session = Depends(get_db)) -> List[Manga]:
    db_mangas = db.query(DBManga).all()
    mangas = []
    for db_manga in db_mangas:
        mangas.append(crud.manga.create_manga_model(db, db_manga))
    return mangas


@router.get("/id/{manga_id}")
def get_manga_by_id(manga_id: int, db: Session = Depends(get_db)) -> Manga:
    db_manga = db.query(DBManga).filter(DBManga.id == manga_id).one_or_none()
    if db_manga is None:
        raise HTTPException(status_code=404, detail="Manga id not found")
    return crud.manga.create_manga_model(db, db_manga)


@router.get("/title/{manga_title}")
def get_manga_by_title(manga_title: str, db: Session = Depends(get_db)) -> Manga:
    manga = crud.manga.get_manga_by_title(db, manga_title)
    if manga is None:
        raise HTTPException(status_code=404, detail="Manga title not found")
    return crud.manga.create_manga_model(db, manga)


@router.get("/genre/{genre_name}")
def get_mangas_by_genres(genre_name: str, db: Session = Depends(get_db)) -> List[Manga]:
    genre = crud.genre.get_genre(db, genre_name)
    if genre is None:
        raise HTTPException(status_code=404, detail="Genre not found")
    relations = crud.genre.get_relations_by_genre_id(db, genre.id)
    return crud.manga.get_mangas_by_relations(db, relations)


@router.get("/author/{author_name}")
def get_mangas_by_author(
    author_name: str, db: Session = Depends(get_db)
) -> List[Manga]:
    author = crud.author.get_author(db, author_name)
    if author is None:
        raise HTTPException(status_code=404, detail="Author not found")
    relations = crud.author.get_relations_by_author_id(db, author.id)
    return crud.manga.get_mangas_by_relations(db, relations)


@router.post("/")
def create_manga(manga: Manga, db: Session = Depends(get_db)) -> Manga:
    return crud.manga.create_manga(db, manga)


@router.put("/id/add_vol")
def add_volume(volume: Volume, db: Session = Depends(get_db)) -> Manga:
    existing_volumes = crud.volume.get_volumes_by_manga_id(db, volume.manga_id)
    for existing_volume in existing_volumes:
        if existing_volume.volume_num == volume.volume_num:
            raise HTTPException(status_code=404, detail="Volume already existing")

    crud.volume.create_volume(db, volume)

    return get_manga_by_id(volume.manga_id, db)


@router.put("/title/add_vol/{manga_title}/{volume_num}")
def add_volume_to_manga_by_title(
    manga_title: str, volume_num: int, db: Session = Depends(get_db)
) -> Manga:
    manga = crud.manga.get_manga_by_title(db, manga_title)
    if manga is None:
        raise HTTPException(status_code=404, detail="Manga title not found")
    volume = crud.volume.get_volume(db, volume_num)
    if volume is None:
        volume = crud.volume.create_volume(db, volume_num)
    crud.volume.create_relation_manga_volume(db, manga.id, volume.id)
    return get_manga_by_title(manga_title, db)
