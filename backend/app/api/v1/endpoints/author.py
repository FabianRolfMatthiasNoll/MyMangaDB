from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.repositories.author import AuthorRepository
from backend.app.schemas import Author, AuthorCreate

router = APIRouter()


@router.get("/getAll", response_model=List[Author])
def get_all_authors(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return AuthorRepository.get_all(db, skip=skip, limit=limit)


@router.get("/{author_id}", response_model=Author)
def get_author(author_id: int, db: Session = Depends(get_db)):
    author = AuthorRepository.get_by_id(db, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return author


@router.post("/create", response_model=Author)
def create_author(author: AuthorCreate, db: Session = Depends(get_db)):
    return AuthorRepository.create(db, author)
