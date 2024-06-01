from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import Author, AuthorCreate
from backend.app.repositories.author import AuthorRepository

router = APIRouter()


@router.get("/getAll", response_model=List[Author])
def get_all_authors(db: Session = Depends(get_db)):
    return AuthorRepository.get_all(db)


@router.post("/create", response_model=Author)
def create_author(author: AuthorCreate, db: Session = Depends(get_db)):
    return AuthorRepository.create(db, author)
