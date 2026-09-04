import logging
import os
import re
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.database import get_db
from backend.app.models import User
from backend.app.repositories import VolumeRepository
from backend.app.repositories.base import RepositoryError
from backend.app.settings import IMAGE_SAVE_PATH

logger = logging.getLogger(__name__)

router = APIRouter()

# Only allow a conservative subset of characters in cover-image filenames.
# Using ``os.path.basename`` strips any path-separator component (including
# ``..``), but this regex is a defense-in-depth check against any remaining
# strange bytes once we have a "clean" basename.
_SAFE_FILENAME_PATTERN = re.compile(r"^[A-Za-z0-9_.\- ]+$")

# Cap individual cover-image uploads at 20 MiB. Cover art should comfortably
# fit well under that bound.
MAX_IMAGE_BYTES = 20 * 1024 * 1024


def _sanitize_filename(raw: str) -> str:
    """Return a safe basename for ``raw`` or raise ``HTTPException(400)``.

    The raw value comes from an untrusted multipart form field, so it must
    not be trusted. We strip any directory components with ``os.path.basename``
    (which already turns ``../foo`` into ``foo`` on POSIX) and then verify the
    remaining basename contains no separators or NUL bytes, and matches a
    conservative character class.
    """
    if not raw:
        raise HTTPException(status_code=400, detail="Filename is required")

    # Disallow NULs outright; they truncate paths on POSIX.
    if "\x00" in raw:
        raise HTTPException(status_code=400, detail="Invalid filename")

    basename = os.path.basename(raw)

    # ``os.path.basename`` can return an empty string (e.g. for ``"/"`` or
    # ``"."``). Treat that and any result that still contains a separator
    # (Windows-style backslashes) as invalid.
    if not basename or "/" in basename or "\\" in basename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    if not _SAFE_FILENAME_PATTERN.match(basename):
        raise HTTPException(status_code=400, detail="Invalid filename")

    # Refuse dotfiles / ``.`` and ``..`` for paranoia.
    if basename in {".", ".."} or basename.startswith("."):
        raise HTTPException(status_code=400, detail="Invalid filename")

    return basename


def _safe_join(base: str, *parts: str) -> str:
    """Join ``parts`` under ``base`` and refuse results that escape ``base``."""
    base_path = Path(base).resolve()
    candidate = (base_path.joinpath(*parts)).resolve()
    try:
        candidate.relative_to(base_path)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid filename")
    return str(candidate)


async def _save_uploaded_image(file: UploadFile, filename: str) -> str:
    """Validate, stream, and persist an uploaded image.

    Shared by ``save_manga_cover`` and ``save_volume_cover`` so both endpoints
    inherit the same defenses: image content-type check, conservative filename
    sanitization, ``IMAGE_SAVE_PATH`` confinement via ``_safe_join``, an
    explicit ``MAX_IMAGE_BYTES`` cap with rollback on overflow, and a best-
    effort cleanup if the stream errors mid-write.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    safe_name = _sanitize_filename(filename)
    file_path = _safe_join(IMAGE_SAVE_PATH, safe_name)

    os.makedirs(IMAGE_SAVE_PATH, exist_ok=True)

    try:
        bytes_written = 0
        chunk_size = 1024 * 1024
        with open(file_path, "wb") as f:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                bytes_written += len(chunk)
                if bytes_written > MAX_IMAGE_BYTES:
                    f.close()
                    try:
                        os.unlink(file_path)
                    except OSError:
                        pass
                    raise HTTPException(
                        status_code=413,
                        detail="Uploaded image exceeds the maximum allowed size",
                    )
                f.write(chunk)
        return safe_name
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(file_path):
            try:
                os.unlink(file_path)
            except OSError:
                pass
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")


@router.post(
    "/manga/save",
    dependencies=[Depends(deps.get_current_active_superuser)],
)
async def save_manga_cover(
    file: UploadFile = File(...),
    filename: str = Form(...),
    _current_user: User = Depends(deps.get_current_active_superuser),
):
    """Save a cover image. Requires an authenticated admin user. Matches the
    write-vs-read auth split used in :mod:`backend.app.api.v1.endpoints.manga`
    where mutating endpoints are gated by
    :func:`deps.get_current_active_superuser`."""
    safe_name = await _save_uploaded_image(file, filename)
    return {"filename": safe_name}


@router.get("/manga/{filename}")
def get_manga_cover_image(filename: str):
    """Return a manga cover image. The path parameter is untrusted, so it is
    sanitized via :func:`_sanitize_filename` and confined to
    :data:`IMAGE_SAVE_PATH` via :func:`_safe_join` to defend against path
    traversal.

    Note: this endpoint is intentionally unauthenticated. Cover art is
    already visible to anyone who can read manga metadata via the
    auth-gated ``/api/v1/mangas/...`` endpoints, and the frontend renders
    these images via raw ``<img src>`` tags which cannot attach bearer
    tokens. Filename sanitization is the real defense here.
    """
    safe_name = _sanitize_filename(filename)
    file_path = _safe_join(IMAGE_SAVE_PATH, safe_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)


@router.put(
    "/volume/{manga_id}/{volume_id}",
    dependencies=[Depends(deps.get_current_active_superuser)],
)
async def save_volume_cover(
    manga_id: int,
    volume_id: int,
    file: UploadFile = File(...),
    filename: str = Form(...),
    db: Session = Depends(get_db),
):
    """Save a per-volume cover image and link it to the volume row.

    Requires an authenticated admin user (the volume collection already
    belongs to a manga, so authorizing the write here implicitly authorizes
    the manga edit too). The upload inherits the same defenses as the manga
    cover endpoint via :func:`_save_uploaded_image`. The volume's previous
    cover file, if any, is removed by :class:`VolumeRepository` when the new
    filename differs.
    """
    safe_name = await _save_uploaded_image(file, filename)
    try:
        VolumeRepository.update_cover(db, manga_id, volume_id, safe_name)
    except RepositoryError as e:
        # The repository raised because no such volume exists for that manga;
        # remove the orphaned file we just wrote so we don't leak disk.
        orphan = os.path.join(IMAGE_SAVE_PATH, safe_name)
        try:
            os.remove(orphan)
        except OSError:
            pass
        raise HTTPException(status_code=404, detail=str(e))
    return {"filename": safe_name}


@router.delete(
    "/volume/{manga_id}/{volume_id}",
    dependencies=[Depends(deps.get_current_active_superuser)],
)
async def remove_volume_cover(
    manga_id: int,
    volume_id: int,
    db: Session = Depends(get_db),
):
    """Remove a volume's cover image (file + DB column)."""
    try:
        VolumeRepository.clear_cover(db, manga_id, volume_id)
    except RepositoryError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"status": "ok"}


@router.get("/volume/{filename}")
def get_volume_cover_image(filename: str):
    """Return a volume cover image. See :func:`get_manga_cover_image` for the
    rationale on authentication and path-traversal protection."""
    safe_name = _sanitize_filename(filename)
    file_path = _safe_join(IMAGE_SAVE_PATH, safe_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)
