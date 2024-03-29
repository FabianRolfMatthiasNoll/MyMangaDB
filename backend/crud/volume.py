from typing import Union, List

from sqlalchemy.orm import Session

from backend.models import Volume as DBVolume
from backend.schema import Volume


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
            id=db_volume.id,
            volume_num=db_volume.volume_num,
            cover_image=db_volume.cover_image,
            manga_id=db_volume.manga_id,
        )
        volumes.append(volume)
    return volumes


def create_volume(db: Session, new_volume: Volume):
    db_volume = DBVolume()
    db_volume.volume_num = new_volume.volume_num
    db_volume.cover_image = new_volume.cover_image
    db_volume.manga_id = new_volume.manga_id
    db.add(db_volume)
    db.commit()


def delete_volume(db: Session, volume_id: int):
    db.query(DBVolume).filter(DBVolume.id == volume_id).delete()
    db.commit()


def delete_volumes_by_manga(db: Session, manga_id: int):
    db.query(DBVolume).filter(DBVolume.manga_id == manga_id).delete()
    db.commit()
