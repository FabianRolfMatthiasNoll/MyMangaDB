from sqlalchemy.orm import Session

import crud.author
import crud.genre
import crud.volume
import models
import schema


def create_manga_model(db: Session, db_manga: models.Manga) -> schema.Manga:
    manga_data = {"id": db_manga.id, "title": db_manga.title, "description": db_manga.description,
                  "volumes": crud.volume.get_volumes_by_manga_id(db, db_manga.id),
                  "total_volumes": db_manga.totalVolumes,
                  "authors": crud.author.get_authors_by_manga_id(db, db_manga.id),
                  "genres": [g.__dict__ for g in crud.genre.get_genres_by_manga_id(db, db_manga.id)]}
    manga = schema.Manga(**manga_data)
    return manga


def create_manga(db, manga: schema.Manga):
    manga_model = models.Manga()
    manga_model.title = manga.title
    manga_model.description = manga.description
    manga_model.totalVolumes = manga.total_volumes
    db.add(manga_model)
    db.commit()
    db.refresh(manga_model)
    for genre in manga.genres:
        result_genre = crud.genre.get_genre(db, genre.name)
        if result_genre is None:
            result_genre = crud.genre.create_genre(db, genre.name)
        # when creating manga there can be not relations, so we just have to create it.
        crud.genre.create_relation(db, result_genre.id, manga_model.id)
    for author in manga.authors:
        result_author = crud.author.get_author(db, author.name)
        if result_author is None:
            result_author = crud.author.create_author(db, author.name)
        result_role = crud.author.get_role(db, author.role)
        if result_role is None:
            result_role = crud.author.create_role(db, author.role)
        crud.author.create_relation(db, result_author.id, manga_model.id, result_role.id)
    return manga
