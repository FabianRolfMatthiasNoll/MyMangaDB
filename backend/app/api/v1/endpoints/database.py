import asyncio
import logging
import os
import re
import shutil
import tempfile
import zipfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, Response

from backend.app.api import deps
from backend.app.database import engine
from backend.app.models import User
from backend.config import DATABASE_PATH, IMAGE_PATH

router = APIRouter()

# Refuse uploads larger than 1 GiB. A full library export is bounded by
# disk usage, but a sensible upper guard helps against trivial DoS.
MAX_IMPORT_BYTES = 1024 * 1024 * 1024

# Only allow the exact filename pattern we use for the application database
# when picking which entry inside the ZIP counts as "the database". This also
# stops things like `..\\..\\foo.db` from being treated as the database file.
_DB_BASENAME_PATTERN = re.compile(r"^[A-Za-z0-9_.\- ]+\.db$")


def _is_within(directory: Path, target: Path) -> bool:
    """Return True iff ``target`` resolves to a path inside ``directory``."""
    try:
        target.absolute().resolve().relative_to(directory.absolute().resolve())
        return True
    except ValueError:
        return False


@router.get(
    "/export",
    response_class=Response,
    dependencies=[Depends(deps.get_current_active_superuser)],
)
async def export_database() -> Response:
    """
    Export the database and images as a ZIP file.

    Requires an authenticated admin user. Both reading the live database file
    (which contains user password hashes) and downloading every stored image
    are inherently privileged operations.

    Returns:
        Response: A ZIP file containing the database and images.
        The response will have the following headers:
        - Content-Type: application/zip
        - Content-Disposition: attachment; filename="mangadb_export.zip"
    """
    temp_zip_path = None
    try:
        logging.info("Starting database export")
        logging.info(f"Database path: {DATABASE_PATH}")
        logging.info(f"Image path: {IMAGE_PATH}")

        # Close all database connections
        logging.info("Closing database connections")
        engine.dispose()

        # Create a temporary file for the ZIP
        temp_zip = tempfile.NamedTemporaryFile(delete=False, suffix=".zip")
        temp_zip_path = temp_zip.name
        temp_zip.close()

        # Create the ZIP file with compression level 1 for faster compression
        with zipfile.ZipFile(
            temp_zip_path, "w", zipfile.ZIP_DEFLATED, compresslevel=1
        ) as zipf:
            # Add the database file
            if os.path.exists(DATABASE_PATH):
                logging.info("Adding database file to ZIP")
                # Create a temporary copy of the database file
                temp_db = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
                temp_db_path = temp_db.name
                temp_db.close()

                try:
                    # Copy the database file to the temporary location
                    shutil.copy2(DATABASE_PATH, temp_db_path)
                    # Add the temporary copy to the ZIP
                    zipf.write(temp_db_path, os.path.basename(DATABASE_PATH))
                finally:
                    # Clean up the temporary database file
                    if os.path.exists(temp_db_path):
                        os.unlink(temp_db_path)

            # Add the images directory
            if os.path.exists(IMAGE_PATH):
                logging.info("Adding images to ZIP")
                for root, _, files in os.walk(IMAGE_PATH):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(
                            file_path, os.path.dirname(IMAGE_PATH)
                        )
                        logging.info(f"Adding file to ZIP: {arcname}")
                        try:
                            zipf.write(file_path, arcname)
                        except Exception as e:
                            logging.error(
                                f"Error adding file {file_path} to ZIP: {str(e)}"
                            )
                            continue

        # Get file size
        file_size = os.path.getsize(temp_zip_path)
        logging.info(f"ZIP file size: {file_size} bytes")

        if file_size == 0:
            raise HTTPException(status_code=500, detail="Generated ZIP file is empty")

        # Return the file with streaming enabled
        return FileResponse(
            temp_zip_path,
            media_type="application/zip",
            filename="mangadb_export.zip",
            background=lambda: asyncio.create_task(cleanup_file(temp_zip_path)),
            headers={
                "Content-Disposition": 'attachment; filename="mangadb_export.zip"',
                "Content-Type": "application/zip",
                "Access-Control-Expose-Headers": "Content-Disposition",
            },
        )

    except Exception as e:
        # Clean up the temporary file if it exists
        if temp_zip_path and os.path.exists(temp_zip_path):
            try:
                os.unlink(temp_zip_path)
            except Exception as cleanup_error:
                logging.error(f"Error cleaning up temporary file: {cleanup_error}")

        logging.error(f"Export failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


async def cleanup_file(file_path: str):
    """Clean up a file after it has been sent"""
    try:
        if file_path and os.path.exists(file_path):
            os.unlink(file_path)
    except Exception as e:
        logging.error(f"Error in background cleanup: {str(e)}")


@router.post(
    "/import",
    dependencies=[Depends(deps.get_current_active_superuser)],
)
async def import_database(
    file: UploadFile = File(...),
    # ``current_user`` is unused but pulling it through the router keeps the
    # 401/403 behavior consistent and makes the dependency intent obvious in
    # OpenAPI output.
    _current_user: User = Depends(deps.get_current_active_superuser),
):
    """
    Import a database and images from a ZIP file. Requires an authenticated
    admin user. The handler rejects uploads that are not valid ZIP archives,
    exceed :data:`MAX_IMPORT_BYTES`, or contain entries whose resolved paths
    fall outside the extraction directory (zip-slip protection).
    """
    temp_dir = None
    try:
        # Close all database connections
        logging.info("Closing database connections")
        engine.dispose()

        # Create a temporary directory for the import
        temp_dir = tempfile.mkdtemp(prefix="mangadb_import_")
        temp_zip = os.path.join(temp_dir, "import.zip")

        # Stream the upload to disk with an explicit byte cap so a malicious
        # client cannot exhaust disk or memory by streaming a huge body.
        bytes_written = 0
        chunk_size = 1024 * 1024
        with open(temp_zip, "wb") as buffer:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                bytes_written += len(chunk)
                if bytes_written > MAX_IMPORT_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail="Uploaded archive exceeds the maximum allowed size",
                    )
                buffer.write(chunk)

        # Open the archive explicitly to reject anything that is not a valid
        # ZIP before we touch ``extractall``. ``extractall`` would happily
        # write outside ``temp_dir`` if a member name had traversal segments
        # in it, so we extract each member ourselves after checking it.
        try:
            with zipfile.ZipFile(temp_zip, "r") as zipf:
                # Reject archives whose entry names try to escape the
                # extraction directory (zip-slip) or contain NULs / absolute
                # paths. We resolve each member against temp_dir and require
                # it to stay under that directory.
                for member in zipf.infolist():
                    member_path = Path(temp_dir) / member.filename
                    if not _is_within(Path(temp_dir), member_path.resolve()):
                        raise HTTPException(
                            status_code=400,
                            detail=(
                                "Archive contains entries with illegal path " "names"
                            ),
                        )

                # Identify which member is "the database". We require the
                # basename (no path separators) to look like a plain db
                # filename so members like ``../../../etc/passwd.db`` are
                # never treated as the database.
                db_member = None
                for member in zipf.infolist():
                    basename = os.path.basename(member.filename)
                    if member.filename.endswith(".db") and _DB_BASENAME_PATTERN.match(
                        basename
                    ):
                        db_member = member.filename
                        break

                if not db_member:
                    raise HTTPException(
                        status_code=400,
                        detail="No database file found in the ZIP",
                    )

                # Back up the current database and images before we mutate
                # anything; a corrupted upload should still be recoverable.
                backup_dir = os.path.join(os.path.dirname(DATABASE_PATH), "backup")
                os.makedirs(backup_dir, exist_ok=True)

                if os.path.exists(DATABASE_PATH):
                    shutil.copy2(
                        DATABASE_PATH,
                        os.path.join(backup_dir, "database_backup.db"),
                    )

                if os.path.exists(IMAGE_PATH):
                    backup_images = os.path.join(backup_dir, "images_backup")
                    if os.path.exists(backup_images):
                        shutil.rmtree(backup_images)
                    shutil.copytree(IMAGE_PATH, backup_images)

                # Extract every member, double-checking the resolved path on
                # each write to defend against symlink-style tricks.
                for member in zipf.infolist():
                    member_target = (Path(temp_dir) / member.filename).resolve()
                    if not _is_within(Path(temp_dir), member_target):
                        raise HTTPException(
                            status_code=400,
                            detail=(
                                "Archive contains entries with illegal path " "names"
                            ),
                        )
                    zipf.extract(member, temp_dir)

                # Move the database file
                extracted_db = os.path.join(temp_dir, db_member)
                if not _is_within(Path(temp_dir), Path(extracted_db).resolve()):
                    raise HTTPException(
                        status_code=400, detail="Invalid database path in archive"
                    )
                if os.path.exists(extracted_db):
                    shutil.move(extracted_db, DATABASE_PATH)

                # Move the images directory if one was provided.
                extracted_images = os.path.join(temp_dir, "images")
                candidate = Path(extracted_images).resolve()
                if not _is_within(Path(temp_dir), candidate):
                    raise HTTPException(
                        status_code=400, detail="Invalid images path in archive"
                    )
                if os.path.exists(extracted_images):
                    if os.path.exists(IMAGE_PATH):
                        shutil.rmtree(IMAGE_PATH)
                    shutil.move(extracted_images, IMAGE_PATH)

        except zipfile.BadZipFile:
            raise HTTPException(
                status_code=400, detail="Uploaded file is not a valid ZIP archive"
            )

        return {"message": "Import successful"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Import failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
    finally:
        if temp_dir and os.path.isdir(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)
