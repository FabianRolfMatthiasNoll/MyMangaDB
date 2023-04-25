from typing import Union, List

from fastapi import HTTPException
from sqlalchemy.orm import Session

from models import Volume as DBVolume
from schema import Volume


def get_volume_by_id(db: Session, volume_id: int) -> DBVolume:
    volume: Union[DBVolume, None] = (
        db.query(DBVolume).filter(DBVolume.id == volume_id).one_or_none()
    )
    return volume


def get_volumes_by_manga_id(db: Session, manga_id: int) -> List[Volume]:
    db_volumes: List[DBVolume] = (
        db.query(DBVolume).filter(DBVolume.manga_id == manga_id).all()
    )
    volumes: List[Volume] = []
    for db_volume in db_volumes:
        volume = Volume(**db_volume)
        volumes.append(volume)
    return volumes


# def create_volume(db: Session, volume_num: int) -> DBVolume:
#     volume = DBVolume()
#     volume.volume = volume_num
#     db.add(volume)
#     db.commit()
#     db.refresh(volume)

#     return volume


# def create_relation_manga_volume(db: Session, manga_id: int, volume_id: int):
#     existing_relations = get_volume_relations_by_manga(db, manga_id)
#     for existing_relation in existing_relations:
#         if existing_relation.volumeID == volume_id:
#             raise HTTPException(
#                 status_code=400, detail="Volume Relation already exists"
#             )
#     relation = models.RelationMangaVolume()
#     relation.mangaID = manga_id
#     relation.volumeID = volume_id

#     db.add(relation)
#     db.commit()
