from sqlalchemy import Column, Enum, Integer, String, ForeignKey, LargeBinary, Text
from backend.database import Base


class Manga(Base):
    __tablename__ = "manga"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="unknown")
    description = Column(String, default="no description provided")
    total_volumes = Column(Integer, default=0)
    cover_image = Column(Text, default="")
    reading_status = Column(
        Enum("not_set", "reading", "completed", "canceled", name="reading_status"),
        default="not_set",
    )
    collection_status = Column(
        Enum(
            "not_set",
            "completed",
            "ongoing",
            "incomplete",
            "canceled",
            name="collection_status",
        ),
        default="not_set",
    )


class Genre(Base):
    __tablename__ = "genre"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)


class Volume(Base):
    __tablename__ = "volume"

    id = Column(Integer, primary_key=True, index=True)
    volume_num = Column(Integer)
    cover_image = Column(Text, default="")
    manga_id = Column(Integer, ForeignKey(Manga.__table__.c.id))


class Author(Base):
    __tablename__ = "author"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)


class RelationMangaGenre(Base):
    __tablename__ = "relationMangaGenre"

    id = Column(Integer, primary_key=True, index=True)
    mangaID = Column(Integer, ForeignKey(Manga.__table__.c.id))
    genreID = Column(Integer, ForeignKey(Genre.__table__.c.id))


class RelationMangaAuthor(Base):
    __tablename__ = "relationMangaAuthor"

    id = Column(Integer, primary_key=True, index=True)
    mangaID = Column(Integer, ForeignKey(Manga.__table__.c.id))
    authorID = Column(Integer, ForeignKey(Author.__table__.c.id))
