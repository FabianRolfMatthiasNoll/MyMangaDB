from typing import List, Optional
from enum import Enum as PyEnum
from pydantic import BaseModel, Field


class ReadingStatus(PyEnum):
    not_set = "not_set"
    reading = "reading"
    completed = "completed"
    canceled = "canceled"


class CollectionStatus(PyEnum):
    not_set = "not_set"
    completed = "completed"
    ongoing = "ongoing"
    incomplete = "incomplete"
    canceled = "canceled"


class Genre(BaseModel):
    id: int
    name: str


class Author(BaseModel):
    id: int
    name: str
    role: str


class Volume(BaseModel):
    id: int
    volume_num: int
    manga_id: int
    cover_image: str


class Manga(BaseModel):
    id: int
    title: str = Field(min_length=1)
    description: str
    total_volumes: int
    volumes: List[Volume]
    authors: List[Author]
    genres: List[Genre]
    cover_image: str
    reading_status: ReadingStatus = ReadingStatus.not_set
    collection_status: CollectionStatus = CollectionStatus.not_set
