from typing import Union, List

from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
import schema
from models import Author, Role


def get_volume(db: Session, volume_num: int) -> models.Volume:
    volume: Union[models.Volume, None] = db.query(models.Volume).filter(models.Volume.volume == volume_num).one_or_none()
    return volume


def get_volumes_by_manga_id(db: Session, manga_id: int) -> List:
    relations = get_volume_relations_by_manga(db, manga_id)
    volumes: List[int] = []
    for relation in relations:
        volume: Union[models.Volume, None] = db.query(models.Volume)\
            .filter(models.Volume.id == relation.volumeID).one_or_none()
        if volume is None:
            raise HTTPException(
                status_code=404,
                detail="Linked Volume not found"
            )
        volume_obj = get_volume(db, volume.volume)
        volumes.append(volume_obj.volume)
    return volumes


def get_volume_relations_by_manga(db: Session, manga_id: int) -> List[models.RelationMangaVolume]:
    relations: List[models.RelationMangaVolume] = db.query(models.RelationMangaVolume)\
        .filter(models.RelationMangaVolume.mangaID == manga_id).all()
    return relations


def create_volume(db: Session, volume_num: int) -> models.Volume:
    volume = models.Volume()
    volume.volume = volume_num
    db.add(volume)
    db.commit()
    db.refresh(volume)

    return volume


def create_relation_manga_volume(db: Session, manga_id: int, volume_id: int):
    existing_relations = get_volume_relations_by_manga(db, manga_id)
    for existing_relation in existing_relations:
        if existing_relation.volumeID == volume_id:
            raise HTTPException(
                status_code=400,
                detail="Volume Relation already exists"
            )
    relation = models.RelationMangaVolume()
    relation.mangaID = manga_id
    relation.volumeID = volume_id

    db.add(relation)
    db.commit()
