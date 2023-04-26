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
        db.query(DBVolume)
        .filter(DBVolume.manga_id == manga_id)
        .order_by(DBVolume.volume_num.asc())
        .all()
    )
    volumes: List[Volume] = []
    for db_volume in db_volumes:
        volume = Volume(
            volume_num=db_volume.volume_num,
            cover_image=db_volume.cover_image,
            manga_id=db_volume.manga_id,
        )
        volumes.append(volume)
    return volumes


def create_volume(db: Session, new_volume: Volume):
    # TODO: Try to get a cover image else let it be empty
    db_volume = DBVolume()
    db_volume.volume_num = new_volume.volume_num
    # db_volume.cover_image = new_volume.cover_image
    db_volume.manga_id = new_volume.manga_id
    db.add(db_volume)
    db.commit()
