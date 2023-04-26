from typing import List

from pydantic import BaseModel, Field


class Genre(BaseModel):
    name: str


class Author(BaseModel):
    name: str
    role: str


class Volume(BaseModel):
    volume_num: int
    cover_image: bytes
    manga_id: int


class Manga(BaseModel):
    title: str = Field(min_length=1)
    description: str
    total_volumes: int
    cover_image: str
    volumes: List[Volume]
    authors: List[Author]
    genres: List[Genre]
