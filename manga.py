from typing import List
from uuid import UUID

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()


class Manga(BaseModel):
    id: UUID
    title: str = Field(min_length=1)
    author: str
    description: str
    genres: List[str]


MANGAS = []


@app.get("/")
def read_api():
    return MANGAS


@app.post("/")
def create_manga(manga: Manga):
    MANGAS.append(manga)
    return manga


@app.put("/{manga_id}")
def update_manga(manga_id: UUID, manga: Manga):
    counter = 0

    for x in MANGAS:
        counter += 1
        if x.ID == manga_id:
            MANGAS[counter - 1] = manga
            return MANGAS[counter - 1]
    raise HTTPException(
        status_code=404,
        detail=f"ID {manga_id}: Does not exist"
    )

@app.delete("/{manga_id}")
def delete_manga(manga_id: UUID):
    counter = 0

    for x in MANGAS:
        counter += 1
        if x.ID == manga_id:
            del MANGAS[counter - 1]
            return f"ID: {manga_id} deleted"
    raise HTTPException(
        status_code=404,
        detail=f"ID {manga_id}: Does not exist"
    )