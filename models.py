from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class Manga(Base):
    __tablename__ = "manga"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    totalVolumes = Column(Integer)


class Genre(Base):
    __tablename__ = "genre"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)


class Volume(Base):
    __tablename__ = "volume"

    id = Column(Integer, primary_key=True, index=True)
    volume = Column(Integer)


class Author(Base):
    __tablename__ = "author"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)


class Role(Base):
    __tablename__ = "role"

    # TODO: Rename to name on next datadrop
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String)


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


class RelationMangaVolume(Base):
    __tablename__ = "relationMangaVolume"

    id = Column(Integer, primary_key=True, index=True)
    mangaID = Column(Integer, ForeignKey(Manga.__table__.c.id))
    volumeID = Column(Integer, ForeignKey(Volume.__table__.c.id))