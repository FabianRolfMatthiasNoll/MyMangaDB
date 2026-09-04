import logging
import os

from sqlalchemy.orm import Session

from backend.app import settings
from backend.app.models import Volume as VolumeModel

from .base import BaseRepository, RepositoryError

logger = logging.getLogger(__name__)


class VolumeRepository(BaseRepository):
    """Data access for ``Volume`` rows.

    Volume cover management is the responsibility of this repository so the
    SQL stays co-located with the entity. The cover image itself lives on
    disk under :data:`backend.app.settings.IMAGE_SAVE_PATH` and only the
    filename is stored on the row.
    """

    @staticmethod
    def _get(db: Session, manga_id: int, volume_id: int) -> VolumeModel:
        volume = (
            db.query(VolumeModel)
            .filter(
                VolumeModel.id == volume_id,
                VolumeModel.manga_id == manga_id,
            )
            .first()
        )
        if not volume:
            raise RepositoryError(f"Volume {volume_id} for manga {manga_id} not found")
        return volume

    @staticmethod
    def _remove_file(filename: str) -> None:
        path = os.path.join(settings.IMAGE_SAVE_PATH, str(filename))
        if not os.path.exists(path):
            return
        try:
            os.remove(path)
        except OSError as e:
            logger.warning("Failed to remove volume cover file %s: %s", path, e)

    @staticmethod
    def update_cover(
        db: Session, manga_id: int, volume_id: int, filename: str
    ) -> VolumeModel:
        """Set ``cover_image`` on the volume row and remove any previous file.

        Idempotent if the new filename equals the existing one (the old file
        is not deleted, since it is the file we just wrote).
        """
        volume = VolumeRepository._get(db, manga_id, volume_id)
        if volume.cover_image and volume.cover_image != filename:
            VolumeRepository._remove_file(volume.cover_image)
        volume.cover_image = filename
        BaseRepository.commit_session(db)
        return volume

    @staticmethod
    def clear_cover(db: Session, manga_id: int, volume_id: int) -> VolumeModel:
        """Remove the cover image (file + DB column). Idempotent."""
        volume = VolumeRepository._get(db, manga_id, volume_id)
        if volume.cover_image:
            VolumeRepository._remove_file(volume.cover_image)
        volume.cover_image = None
        BaseRepository.commit_session(db)
        return volume
