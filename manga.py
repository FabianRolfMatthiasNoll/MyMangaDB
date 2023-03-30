from typing import List, Union
from uuid import UUID
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
import models
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
def read_api(db: Session = Depends(get_db)):
    return db.query(models.Manga).all()


@app.post("/")
def create_manga(manga: Manga, db: Session = Depends(get_db)) -> Manga:
    manga_model = models.Manga()
    manga_model.title = manga.title
    manga_model.description = manga.description
    for genre in manga.genres:
        models.Genre = genre
    manga_model.author = manga.author

    db.add(manga_model)
    db.commit()

    return manga

