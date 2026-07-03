import os
import re
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from backend.app.api import deps
from backend.app.models import User
from backend.app.settings import IMAGE_SAVE_PATH

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
    # Validate the declared content type header. This is a client-supplied
    # header, but rejecting obvious non-image uploads still trims the attack
    # surface.
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    safe_name = _sanitize_filename(filename)
    file_path = _safe_join(IMAGE_SAVE_PATH, safe_name)

    os.makedirs(IMAGE_SAVE_PATH, exist_ok=True)

    # Stream the upload to disk with an explicit byte cap so a hostile client
    # cannot exhaust disk via a multi-gigabyte body.
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
                    # Roll back the partial file we just created.
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
        return {"filename": safe_name}
    except HTTPException:
        raise
    except Exception as e:
        # Try to remove the partial file if writing failed mid-stream.
        if os.path.exists(file_path):
            try:
                os.unlink(file_path)
            except OSError:
                pass
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")


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


@router.get("/volume/{filename}")
def get_volume_cover_image(filename: str):
    """Return a volume cover image. See :func:`get_manga_cover_image` for
    the rationale on authentication and path-traversal protection."""
    safe_name = _sanitize_filename(filename)
    file_path = _safe_join(IMAGE_SAVE_PATH, safe_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)
