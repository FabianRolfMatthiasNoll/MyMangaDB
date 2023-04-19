from typing import List

from pydantic import BaseModel, Field


class Genre(BaseModel):
    name: str


class Author(BaseModel):
    name: str
    role: str


# TODO: Add saving the cover image into the database.
# TODO: Change volumes from list of ints to strings on next data change
class Manga(BaseModel):
    title: str = Field(min_length=1)
    description: str
    total_volumes: int
    volumes: List[int]
    authors: List[Author]
    genres: List[Genre]
