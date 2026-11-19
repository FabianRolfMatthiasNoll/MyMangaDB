import enum

from sqlalchemy import (
    Column,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    func,
    select,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import column_property, relationship

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


class OwnershipStatus(enum.Enum):
    """Whether a title is part of the collection or only wanted."""

    owned = "owned"
    wishlist = "wishlist"
    ordered = "ordered"


class Role(enum.Enum):
    admin = "admin"
    guest = "guest"


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

    # Derived rather than stored. A denormalized counter has to be kept in
    # sync by every code path that adds or removes a manga-author link, and
    # a single missed path leaves it permanently wrong. Counting the join
    # table is always correct.
    manga_count = column_property(
        select(func.count(manga_author.c.manga_id))
        .where(manga_author.c.author_id == id)
        .correlate_except(manga_author)
        .scalar_subquery()
    )


class Genre(Base):
    __tablename__ = "genres"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

    # Derived rather than stored - see the note on ``Author.manga_count``.
    manga_count = column_property(
        select(func.count(manga_genre.c.manga_id))
        .where(manga_genre.c.genre_id == id)
        .correlate_except(manga_genre)
        .scalar_subquery()
    )


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
    # Whether the title is owned, wanted or on the way. Independent of the
    # reading status - "not started" means different things for a title you
    # own and for a title you only want.
    ownership_status = Column(
        Enum(OwnershipStatus),
        nullable=False,
        default=OwnershipStatus.owned,
        server_default=OwnershipStatus.owned.value,
    )
    summary = Column(Text)
    cover_image = Column(String)

    authors = relationship("Author", secondary=manga_author, back_populates="mangas")
    genres = relationship("Genre", secondary=manga_genre, back_populates="mangas")
    lists = relationship("List", secondary=manga_list, back_populates="mangas")
    volumes = relationship(
        "Volume", back_populates="manga", cascade="all, delete-orphan"
    )


class Source(Base):
    __tablename__ = "sources"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    language = Column(String)


class Settings(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(String)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(Role), default=Role.guest)


Author.mangas = relationship("Manga", secondary=manga_author, back_populates="authors")
Genre.mangas = relationship("Manga", secondary=manga_genre, back_populates="genres")
List.mangas = relationship("Manga", secondary=manga_list, back_populates="lists")
Volume.manga = relationship("Manga", back_populates="volumes")
