from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.schemas import MangaCreate, Manga
from backend.app.database import get_db
from backend.app.repositories.manga import MangaRepository

router = APIRouter()


@router.post("/", response_model=Manga, status_code=status.HTTP_201_CREATED)
def create_manga(manga: MangaCreate, db: Session = Depends(get_db)):
    db_manga = MangaRepository.get_by_id(db, manga_id=manga.id)
    if db_manga:
        raise HTTPException(status_code=400, detail="Manga already exists")
    return MangaRepository.create(db, manga)


@router.get("/", response_model=List[Manga])
def read_mangas(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return MangaRepository.get_all(db, skip=skip, limit=limit)


@router.get("/{manga_id}", response_model=Manga)
def read_manga(manga_id: int, db: Session = Depends(get_db)):
    db_manga = MangaRepository.get_by_id(db, manga_id=manga_id)
    if db_manga is None:
        raise HTTPException(status_code=404, detail="Manga not found")
    return db_manga


@router.put("/{manga_id}", response_model=Manga)
def update_manga(manga_id: int, manga: MangaCreate, db: Session = Depends(get_db)):
    db_manga = MangaRepository.get_by_id(db, manga_id=manga_id)
    if db_manga is None:
        raise HTTPException(status_code=404, detail="Manga not found")
    return MangaRepository.update(db, manga_id=manga_id, manga=manga)


@router.delete("/{manga_id}", response_model=Manga)
def delete_manga(manga_id: int, db: Session = Depends(get_db)):
    db_manga = MangaRepository.get_by_id(db, manga_id=manga_id)
    if db_manga is None:
        raise HTTPException(status_code=404, detail="Manga not found")
    return MangaRepository.delete(db, manga_id=manga_id)
