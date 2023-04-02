from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud.author
import crud.genre
import crud.volume
import models
from crud.manga import create_manga_model, create_manga
from database import get_db
from schema import Manga

router = APIRouter(prefix="/manga", tags=["Manga"])


# TODO: get manga by author, add volume by title


@router.get("/")
def get_all_mangas(db: Session = Depends(get_db)):
    db_mangas = db.query(models.Manga).all()
    mangas = []
    for db_manga in db_mangas:
        mangas.append(create_manga_model(db, db_manga))
    return mangas


@router.get("/id/{manga_id}")
def get_manga_by_id(manga_id: int, db: Session = Depends(get_db)):
    db_manga = db.query(models.Manga).filter(models.Manga.id == manga_id).one_or_none()
    if db_manga is None:
        raise HTTPException(
            status_code=404,
            detail="Manga id not found"
        )
    return create_manga_model(db, db_manga)


@router.get("/title/{manga_title}")
def get_manga_by_title(manga_title: str, db: Session = Depends(get_db)):
    db_manga = db.query(models.Manga).filter(models.Manga.title == manga_title).one_or_none()
    if db_manga is None:
        raise HTTPException(
            status_code=404,
            detail="Manga title not found"
        )
    return create_manga_model(db, db_manga)


@router.get("/genre/{genre_name}")
def get_mangas_by_genres(genre_name: str, db: Session = Depends(get_db)):
    genre = crud.genre.get_genre(db, genre_name)
    if genre is None:
        raise HTTPException(
            status_code=404,
            detail="Genre not found"
        )
    relations = crud.genre.get_relations_by_genre_id(db, genre.id)
    mangas = []
    for relation in relations:
        db_manga = db.query(models.Manga).filter(models.Manga.id == relation.mangaID).one_or_none()
        if db_manga is None:
            raise HTTPException(
                status_code=404,
                detail="Manga id not found"
            )
        mangas.append(create_manga_model(db, db_manga))
    return mangas


@router.post("/")
def create_manga(manga: Manga, db: Session = Depends(get_db)) -> Manga:
    return crud.manga.create_manga(db, manga)


@router.put("/{manga_id}/{volume_num}")
def add_volume_to_manga(manga_id: int, volume_num: int, db: Session = Depends(get_db)):
    volume = crud.volume.get_volume(db, volume_num)
    if volume is None:
        volume = crud.volume.create_volume(db, volume_num)
    crud.volume.create_relation_manga_volume(db, manga_id, volume.id)
    return get_manga_by_id(manga_id, db)
