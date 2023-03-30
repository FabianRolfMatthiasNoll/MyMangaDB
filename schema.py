from typing import List

from pydantic import BaseModel, Field


class Genre(BaseModel):
    id: int
    name: str


class Author(BaseModel):
    name: str
    role: str


class Manga(BaseModel):
    title: str = Field(min_length=1)
    description: str
    total_volumes: int
    volume: int
    authors: List[Author]
    genres: List[str]