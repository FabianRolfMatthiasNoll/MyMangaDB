from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from openpyxl import Workbook, load_workbook
from sqlalchemy.orm import Session
from io import BytesIO

import crud.author as authorManager
import crud.genre as genreManager
import crud.volume as volumeManager
import crud.manga as mangaManager

from database import get_db
from schema import Volume
from models import Manga as DBManga

router = APIRouter(prefix="/excel", tags=["ExcelInOut"])

##########################################  Import   ###########################################################

# TODO: If the title exists already ask the User if he wants to import the new one, keep the old one or keep both
# TODO: Export manga and volume cover images as well as importing
# TODO: Make it possible to export and import to save data over breaking changes


def validate_manga_fields(row):
    """Check if required manga fields are present and return errors if any."""
    (title, description, genres_str, authors_roles_str, _, _) = row
    errors = []
    field_names = ["title", "description", "genres_str", "authors_roles_str"]
    values = [title, description, genres_str, authors_roles_str]
    for field, value in zip(field_names, values):
        if not value:
            errors.append(f"Missing {field} in Manga {title}")
    return errors


def process_genres(db, genres_str, manga_model):
    """Process and relate genres to the given manga model."""
    genre_names = (
        [genre.strip() for genre in genres_str.split(",")] if genres_str else []
    )
    for genre_name in genre_names:
        genre = genreManager.get_genre(db, genre_name) or genreManager.create_genre(
            db, genre_name
        )
        genreManager.create_relation(db, genre.id, manga_model.id)


def process_authors_and_roles(db, authors_roles_str, manga_model):
    """Process authors, roles, and relate them to the given manga model."""
    errors = []
    authors_list = (
        [author_role.strip() for author_role in authors_roles_str.split(",")]
        if authors_roles_str
        else []
    )
    for author_role_str in authors_list:
        parts = author_role_str.split("(")
        author_name = parts[0].strip()
        role = parts[1].replace(")", "").strip() if len(parts) > 1 else None
        if not role:
            errors.append(f"Missing role of {author_name} in Manga {manga_model.title}")
            continue
        author = authorManager.get_author(
            db, author_name
        ) or authorManager.create_author(db, author_name)
        role_obj = authorManager.get_role(db, role) or authorManager.create_role(
            db, role
        )
        authorManager.create_relation(db, author.id, manga_model.id, role_obj.id)
    return errors


@router.post("/import")
async def import_mangas_from_excel(
    file: UploadFile = File(...), db: Session = Depends(get_db)
):
    wb = load_workbook(filename=file.file)
    ws = wb.active
    errors = []

    for row in ws.iter_rows(min_row=2, values_only=True):
        # Validate required fields before processing
        row_errors = validate_manga_fields(row)
        if row_errors:
            errors.extend(row_errors)
            continue

        title, _, _, _, total_volumes, specific_volumes_str = row

        # Create main Manga entry
        manga_model = DBManga(
            title=title, description=row[1], total_volumes=total_volumes
        )
        db.add(manga_model)
        db.commit()
        db.refresh(manga_model)

        # Process genres, authors, roles
        process_genres(db, row[2], manga_model)
        author_errors = process_authors_and_roles(db, row[3], manga_model)
        errors.extend(author_errors)

        # Process Volumes
        volume_nums = (
            [int(vol.strip()) for vol in specific_volumes_str.split(",")]
            if specific_volumes_str
            else []
        )
        for volume_num in volume_nums:
            volume = Volume(
                id=0, volume_num=volume_num, manga_id=manga_model.id, cover_image=""
            )
            volumeManager.create_volume(db, volume)

    if errors:
        return {"message": errors}
    return {"message": "Mangas imported successfully"}


##########################################  Export   ###########################################################


def create_headers(ws):
    """Add headers to the worksheet."""
    ws.append(
        [
            "Title",
            "Description",
            "Genres",
            "Authors(Roles)",
            "Total Volumes",
            "Specific Volumes",
        ]
    )


def get_manga_data(manga):
    """Retrieve manga related data to be used in the worksheet."""
    genres = ", ".join([genre.name for genre in manga.genres])
    authors_roles = ", ".join(
        [f"{author.name}({author.role})" for author in manga.authors]
    )
    specific_volumes = ", ".join([str(volume.volume_num) for volume in manga.volumes])
    return (
        manga.title,
        manga.description,
        genres,
        authors_roles,
        len(manga.volumes),
        specific_volumes,
    )


@router.get("/export")
async def export_mangas_to_excel(db: Session = Depends(get_db)):
    # Fetch and process manga data
    db_mangas = db.query(DBManga).all()
    mangas = [mangaManager.create_manga_model(db, db_manga) for db_manga in db_mangas]

    # Create a new workbook and worksheet
    wb = Workbook()
    ws = wb.active
    ws.title = "Mangas"

    # Add headers
    create_headers(ws)

    # Populate worksheet with manga data
    for manga in mangas:
        ws.append(get_manga_data(manga))

    # Save workbook to a buffer
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    # Return the buffer as a streaming response
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=MyMangaDB_library.xlsx"},
    )