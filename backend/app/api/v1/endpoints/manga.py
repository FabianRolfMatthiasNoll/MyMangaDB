from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.schemas import MangaCreate, Manga
from backend.app.database import get_db
from backend.app.repositories.manga import MangaRepository

router = APIRouter()


@router.post("/create", response_model=Manga, status_code=status.HTTP_201_CREATED)
def create_manga(manga: MangaCreate, db: Session = Depends(get_db)):
    db_manga = MangaRepository.get_by_title(db, title=manga.title)
    if db_manga:
        raise HTTPException(status_code=400, detail="Manga already exists")
    return MangaRepository.create(db, manga)


@router.post(
    "/create-list", response_model=List[Manga], status_code=status.HTTP_201_CREATED
)
def create_manga_list(mangas: List[MangaCreate], db: Session = Depends(get_db)):
    return MangaRepository.create_list(db, mangas)


@router.get("/getAll", response_model=List[Manga])
def get_mangas(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return MangaRepository.get_all(db, skip=skip, limit=limit)


@router.get("/{manga_id}", response_model=Manga)
def get_manga_by_id(manga_id: int, db: Session = Depends(get_db)):
    db_manga = MangaRepository.get_by_id(db, manga_id=manga_id)
    if db_manga is None:
        raise HTTPException(status_code=404, detail="Manga not found")
    return db_manga


@router.get("/by-genre/{genre_id}", response_model=List[Manga])
def get_mangas_by_genre(genre_id: int, db: Session = Depends(get_db)):
    return MangaRepository.get_by_genre(db, genre_id)


@router.get("/by-author/{author_id}", response_model=List[Manga])
def get_mangas_by_author(author_id: int, db: Session = Depends(get_db)):
    return MangaRepository.get_by_author(db, author_id)


@router.get("/by-list/{list_id}", response_model=List[Manga])
def get_mangas_by_list(list_id: int, db: Session = Depends(get_db)):
    return MangaRepository.get_by_list(db, list_id)


@router.get("/by-rating/{rating}", response_model=List[Manga])
def get_mangas_by_star_rating(rating: float, db: Session = Depends(get_db)):
    return MangaRepository.get_by_star_rating(db, rating)


@router.put("/update", response_model=Manga)
def update_manga(manga: Manga, db: Session = Depends(get_db)):
    db_manga = MangaRepository.get_by_id(db, manga.id)
    if db_manga is None:
        raise HTTPException(status_code=404, detail="Manga not found")
    return MangaRepository.update(db, manga=manga)


@router.delete("/{manga_id}", response_model=Manga)
def delete_manga(manga_id: int, db: Session = Depends(get_db)):
    db_manga = MangaRepository.get_by_id(db, manga_id=manga_id)
    if db_manga is None:
        raise HTTPException(status_code=404, detail="Manga not found")
    return MangaRepository.delete(db, manga_id=manga_id)
