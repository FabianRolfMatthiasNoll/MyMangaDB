from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()


# Enum Definitions
class ReadingStatus(enum.Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    completed = "completed"
    on_hold = "on_hold"
    dropped = "dropped"


class OverallStatus(enum.Enum):
    ongoing = "ongoing"
    completed = "completed"
    hiatus = "hiatus"
    cancelled = "cancelled"


class Category(enum.Enum):
    manga = "manga"
    novel = "novel"
    doujinshi = "doujinshi"


# Many-to-Many relationship tables
manga_author = Table(
    "manga_author",
    Base.metadata,
    Column("manga_id", Integer, ForeignKey("mangas.id"), primary_key=True),
    Column("author_id", Integer, ForeignKey("authors.id"), primary_key=True),
)

manga_genre = Table(
    "manga_genre",
    Base.metadata,
    Column("manga_id", Integer, ForeignKey("mangas.id"), primary_key=True),
    Column("genre_id", Integer, ForeignKey("genres.id"), primary_key=True),
)

manga_list = Table(
    "manga_list",
    Base.metadata,
    Column("manga_id", Integer, ForeignKey("mangas.id"), primary_key=True),
    Column("list_id", Integer, ForeignKey("lists.id"), primary_key=True),
)


# Model Definitions
class Author(Base):
    __tablename__ = "authors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    manga_count = Column(Integer, default=0)


class Genre(Base):
    __tablename__ = "genres"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    manga_count = Column(Integer, default=0)


class List(Base):
    __tablename__ = "lists"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)


class Volume(Base):
    __tablename__ = "volumes"
    id = Column(Integer, primary_key=True, index=True)
    volume_number = Column(String, index=True)
    cover_image = Column(String)
    manga_id = Column(Integer, ForeignKey("mangas.id"))


class Manga(Base):
    __tablename__ = "mangas"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    japanese_title = Column(String)
    reading_status = Column(Enum(ReadingStatus))
    overall_status = Column(Enum(OverallStatus))
    star_rating = Column(Float)  # 1 to 5 stars
    language = Column(String)
    category = Column(Enum(Category))
    summary = Column(Text)
    cover_image = Column(String)

    authors = relationship("Author", secondary=manga_author, back_populates="mangas")
    genres = relationship("Genre", secondary=manga_genre, back_populates="mangas")
    lists = relationship("List", secondary=manga_list, back_populates="mangas")
    volumes = relationship("Volume", back_populates="manga")


class Source(Base):
    __tablename__ = "sources"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    language = Column(String)


Author.mangas = relationship("Manga", secondary=manga_author, back_populates="authors")
Genre.mangas = relationship("Manga", secondary=manga_genre, back_populates="genres")
List.mangas = relationship("Manga", secondary=manga_list, back_populates="lists")
Volume.manga = relationship("Manga", back_populates="volumes")
