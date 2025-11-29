import asyncio
import logging
import os
import shutil
import tempfile
import zipfile

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, Response

from backend.app.database import engine
from backend.config import DATABASE_PATH, IMAGE_PATH

router = APIRouter()


@router.get("/export", response_class=Response)
async def export_database() -> Response:
    """
    Export the database and images as a ZIP file.

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


@router.post("/import")
async def import_database(file: UploadFile = File(...)):
    """
    Import a database and images from a ZIP file
    """
    try:
        # Close all database connections
        logging.info("Closing database connections")
        engine.dispose()

        # Create a temporary directory for the import
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save the uploaded file
            temp_zip = os.path.join(temp_dir, "import.zip")
            with open(temp_zip, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Extract the ZIP file
            with zipfile.ZipFile(temp_zip, "r") as zipf:
                # Verify the ZIP contains the database file
                db_file = None
                for name in zipf.namelist():
                    if name.endswith(".db"):
                        db_file = name
                        break

                if not db_file:
                    raise HTTPException(
                        status_code=400, detail="No database file found in the ZIP"
                    )

                # Create a backup of the current database and images
                backup_dir = os.path.join(os.path.dirname(DATABASE_PATH), "backup")
                os.makedirs(backup_dir, exist_ok=True)

                if os.path.exists(DATABASE_PATH):
                    shutil.copy2(
                        DATABASE_PATH, os.path.join(backup_dir, "database_backup.db")
                    )

                if os.path.exists(IMAGE_PATH):
                    backup_images = os.path.join(backup_dir, "images_backup")
                    if os.path.exists(backup_images):
                        shutil.rmtree(backup_images)
                    shutil.copytree(IMAGE_PATH, backup_images)

                # Extract the new files
                zipf.extractall(temp_dir)

                # Move the database file
                extracted_db = os.path.join(temp_dir, db_file)
                if os.path.exists(extracted_db):
                    shutil.move(extracted_db, DATABASE_PATH)

                # Move the images
                extracted_images = os.path.join(temp_dir, "images")
                if os.path.exists(extracted_images):
                    if os.path.exists(IMAGE_PATH):
                        shutil.rmtree(IMAGE_PATH)
                    shutil.move(extracted_images, IMAGE_PATH)

            return {"message": "Import successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
