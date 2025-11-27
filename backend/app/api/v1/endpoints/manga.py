from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.schemas import MangaCreate, Manga
from backend.app.database import get_db
from backend.app.repositories import MangaRepository, ListRepository

router = APIRouter()


@router.post("/create", response_model=Manga, status_code=status.HTTP_201_CREATED)
def create_manga(manga: MangaCreate, db: Session = Depends(get_db)):
    db_manga = MangaRepository.get_by_title(db, title=manga.title, language=manga.language)
    if db_manga:
        raise HTTPException(status_code=400, detail="Manga already exists")
    return MangaRepository.create(db, manga)


@router.post(
    "/create-list", response_model=List[Manga], status_code=status.HTTP_201_CREATED
)
def create_manga_list(mangas: List[MangaCreate], db: Session = Depends(get_db)):
    try:
        return MangaRepository.create_batch(db, mangas)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@router.get(
    "/getAll",
    response_model=List[Manga],
    summary="Get mangas with server-side paging, search and sort",
)
def get_mangas(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search term for title"),
    sort: Optional[str] = Query(
        "asc", regex="^(asc|desc)$", description="Sort by title"
    ),
    db: Session = Depends(get_db),
):
    """
    Liefert eine paginierte Liste von Mangas zurück. Optional können
    Suchbegriff (title LIKE) und Sortierreihenfolge angegeben werden.
    """
    try:
        return MangaRepository.get_all(
            db, skip=skip, limit=limit, search=search, sort=sort
        )  # Implementierung in Repository
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch mangas")


@router.get("/{manga_id}", response_model=Manga)
def get_manga_by_id(manga_id: int, db: Session = Depends(get_db)):
    try:
        db_manga = MangaRepository.get_by_id(db, manga_id=manga_id)
        if db_manga is None:
            raise HTTPException(status_code=404, detail="Manga not found")
        return db_manga
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch manga by ID")


@router.get("/by-genre/{genre_id}", response_model=List[Manga])
def get_mangas_by_genre(genre_id: int, db: Session = Depends(get_db)):
    try:
        return MangaRepository.get_by_genre(db, genre_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch mangas by genre")


@router.get("/by-author/{author_id}", response_model=List[Manga])
def get_mangas_by_author(author_id: int, db: Session = Depends(get_db)):
    try:
        return MangaRepository.get_by_author(db, author_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch mangas by author")


@router.get("/by-list/{list_id}", response_model=List[Manga])
def get_mangas_by_list(list_id: int, db: Session = Depends(get_db)):
    try:
        return MangaRepository.get_by_list(db, list_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch mangas by list")


@router.get("/by-rating/{rating}", response_model=List[Manga])
def get_mangas_by_star_rating(rating: float, db: Session = Depends(get_db)):
    try:
        return MangaRepository.get_by_star_rating(db, rating)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch mangas by rating")


@router.put("/update", response_model=Manga)
def update_manga(manga: Manga, db: Session = Depends(get_db)):
    try:
        db_manga = MangaRepository.get_by_id(db, manga.id)
        if db_manga is None:
            raise HTTPException(status_code=404, detail="Manga not found")
        return MangaRepository.update(db, manga_data=manga)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update manga")


@router.delete("/{manga_id}", response_model=Manga)
def delete_manga(manga_id: int, db: Session = Depends(get_db)):
    try:
        db_manga = MangaRepository.get_by_id(db, manga_id=manga_id)
        if db_manga is None:
            raise HTTPException(status_code=404, detail="Manga not found")
        return MangaRepository.delete(db, manga_id=manga_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete manga")
