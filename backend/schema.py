from typing import List

from pydantic import BaseModel, Field


class Genre(BaseModel):
    name: str


class Author(BaseModel):
    name: str
    role: str


class Volume(BaseModel):
    volume: int
    cover_image: bytes


class Manga(BaseModel):
    title: str = Field(min_length=1)
    description: str
    total_volumes: int
    cover_image: bytes
    volumes: List[Volume]
    authors: List[Author]
    genres: List[Genre]
