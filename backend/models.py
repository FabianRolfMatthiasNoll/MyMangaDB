from sqlalchemy import Column, Integer, String, ForeignKey, LargeBinary, Text
from database import Base


class Manga(Base):
    __tablename__ = "manga"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    total_volumes = Column(Integer, default=0)
    cover_image = Column(Text, default="")


class Genre(Base):
    __tablename__ = "genre"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)


class Volume(Base):
    __tablename__ = "volume"

    id = Column(Integer, primary_key=True, index=True)
    volume_num = Column(Integer)
    cover_image = Column(LargeBinary, default=b"")
    manga_id = Column(Integer, ForeignKey(Manga.__table__.c.id))


class Author(Base):
    __tablename__ = "author"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)


class Role(Base):
    __tablename__ = "role"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)


class RelationMangaGenre(Base):
    __tablename__ = "relationMangaGenre"

    id = Column(Integer, primary_key=True, index=True)
    mangaID = Column(Integer, ForeignKey(Manga.__table__.c.id))
    genreID = Column(Integer, ForeignKey(Genre.__table__.c.id))


class RelationMangaAuthorRole(Base):
    __tablename__ = "relationMangaAuthorRole"

    id = Column(Integer, primary_key=True, index=True)
    mangaID = Column(Integer, ForeignKey(Manga.__table__.c.id))
    authorID = Column(Integer, ForeignKey(Author.__table__.c.id))
    roleID = Column(Integer, ForeignKey(Role.__table__.c.id))
