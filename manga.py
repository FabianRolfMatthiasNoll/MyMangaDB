from typing import List, Union
from uuid import UUID
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field

import crud.genre
import crud.author
import crud.volume
import models
import schema
from database import engine, SessionLocal
from sqlalchemy.orm import Session

from schema import Manga

app = FastAPI()

models.Base.metadata.create_all(bind=engine)


def get_db():
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


@app.get("/")
def get_all_mangas(db: Session = Depends(get_db)):
    db_mangas = db.query(models.Manga).all()
    mangas = []
    for db_manga in db_mangas:
        manga_data = {"id": db_manga.id, "title": db_manga.title, "description": db_manga.description,
                      "total_volumes": db_manga.totalVolumes,
                      "authors": crud.author.get_authors_by_manga_id(db, db_manga.id),
                      "genres": [g.__dict__ for g in crud.genre.get_genres_by_manga_id(db, db_manga.id)]}
        manga = schema.Manga(**manga_data)
        mangas.append(manga)
    return mangas


@app.get("/manga/{manga_id}")
def get_manga_by_id(manga_id: int, db: Session = Depends(get_db)):
    db_manga = db.query(models.Manga).filter(models.Manga.id == manga_id).one_or_none()
    if db_manga is None:
        raise HTTPException(
            status_code=404,
            detail="Manga id not found"
        )
    # TODO: construct complete manga model
    return db_manga
@app.post("/")
def create_manga(manga: Manga, db: Session = Depends(get_db)) -> Manga:
    manga_model = models.Manga()
    manga_model.title = manga.title
    manga_model.description = manga.description
    manga_model.totalVolumes = manga.total_volumes

    db.add(manga_model)
    db.commit()
    db.refresh(manga_model)

    for genre in manga.genres:
        result_genre = crud.genre.get_genre(db, genre)
        if result_genre is None:
            result_genre = crud.genre.create_genre(db, genre)
        # when creating manga there can be not relations, so we just have to create it.
        crud.genre.create_relation(db, result_genre.id, manga_model.id)

    for author in manga.authors:
        result_author = crud.author.get_author(db, author.name)
        if result_author is None:
            result_author = crud.author.create_author(db, author.name)
        result_role = crud.author.get_role(db, author.role)
        if result_role is None:
            result_role = crud.author.create_role(db, author.role)
        crud.author.create_relation(db, result_author.id, manga_model.id, result_role.id)

    return manga


@app.put("/manga/{manga_id}/{volume_num}")
def add_volume_to_manga(manga_id: int, volume_num: int, db: Session = Depends(get_db)):
    volume = crud.volume.get_volume(db, volume_num)
    if volume is None:
        volume = crud.volume.create_volume(db, volume_num)
    crud.volume.create_relation_manga_volume(db, manga_id, volume.id)
    return get_manga_by_id(manga_id, db)

