from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


# Enum Definitions
class ReadingStatus(str, Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    completed = "completed"
    on_hold = "on_hold"
    dropped = "dropped"


class OverallStatus(str, Enum):
    ongoing = "ongoing"
    completed = "completed"
    hiatus = "hiatus"
    cancelled = "cancelled"


class Category(str, Enum):
    manga = "manga"
    novel = "novel"
    doujinshi = "doujinshi"


class Role(str, Enum):
    admin = "admin"
    guest = "guest"


# Schemas
class AuthorBase(BaseModel):
    name: str


class AuthorCreate(AuthorBase):
    pass


class Author(AuthorBase):
    id: int
    manga_count: int = 0

    class Config:
        from_attributes = True


class GenreBase(BaseModel):
    name: str


class GenreCreate(GenreBase):
    pass


class Genre(GenreBase):
    id: int
    manga_count: int = 0

    class Config:
        from_attributes = True


class ListBase(BaseModel):
    name: str


class ListCreate(ListBase):
    pass


class ListModel(ListBase):
    id: int

    class Config:
        from_attributes = True


class VolumeBase(BaseModel):
    volume_number: str
    cover_image: Optional[str] = None


class VolumeCreate(VolumeBase):
    pass


class Volume(VolumeBase):
    id: int
    manga_id: int

    class Config:
        from_attributes = True


class MangaBase(BaseModel):
    title: str
    japanese_title: Optional[str] = None
    reading_status: Optional[ReadingStatus] = None
    overall_status: Optional[OverallStatus] = None
    star_rating: Optional[float] = Field(None, ge=1, le=5)
    language: Optional[str] = None
    category: Category
    summary: Optional[str] = None
    cover_image: Optional[str] = None


class MangaCreate(MangaBase):
    authors: List[AuthorCreate]
    genres: List[GenreCreate]
    lists: List[ListCreate]
    volumes: List[VolumeCreate]


class Manga(MangaBase):
    id: int
    authors: List[Author]
    genres: List[Genre]
    lists: List[ListModel]
    volumes: List[Volume]

    class Config:
        from_attributes = True


class SourceBase(BaseModel):
    name: str
    language: str


class SourceCreate(SourceBase):
    pass


class Source(SourceBase):
    id: int

    class Config:
        from_attributes = True


class SettingsBase(BaseModel):
    key: str
    value: str


class Settings(SettingsBase):
    id: int

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str
    role: Role = Role.guest


class User(UserBase):
    id: int
    role: Role

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[Role] = None


class UserUpdatePassword(BaseModel):
    username: str
    password: str


class StatisticCount(BaseModel):
    label: str
    count: int


class Statistics(BaseModel):
    total_mangas: int
    total_volumes: int
    total_authors: int
    total_genres: int
    total_lists: int
    reading_status_distribution: List[StatisticCount]
    overall_status_distribution: List[StatisticCount]
    category_distribution: List[StatisticCount]
    rating_distribution: List[StatisticCount]
    top_genres: List[StatisticCount]
    top_authors: List[StatisticCount]


class ImportResultDetail(BaseModel):
    title: str
    status: str  # "imported", "skipped", "failed"
    info_code: str  # "MANGA_EXISTS", "FETCH_FAILED", etc.


class ImportResponse(BaseModel):
    total: int
    imported: int
    skipped: int
    failed: int
    logs: List[ImportResultDetail]
