from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import Genre, GenreCreate
from backend.app.repositories.genre import GenreRepository

router = APIRouter()


@router.get("/getAll", response_model=List[Genre])
def get_all_genres(db: Session = Depends(get_db)):
    return GenreRepository.get_all(db)


@router.get("/{genre_id}", response_model=Genre)
def get_genre(genre_id: int, db: Session = Depends(get_db)):
    genre = GenreRepository.get_by_id(db, genre_id)
    if not genre:
        raise HTTPException(status_code=404, detail="Genre not found")
    return genre


@router.post("/create", response_model=Genre)
def create_genre(genre: GenreCreate, db: Session = Depends(get_db)):
    return GenreRepository.create(db, genre)
