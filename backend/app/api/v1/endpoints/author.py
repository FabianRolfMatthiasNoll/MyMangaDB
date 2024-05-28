from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import Author
from backend.app.repositories.author import AuthorRepository

router = APIRouter()


@router.get("/getAll", response_model=List[Author])
def get_all_authors(db: Session = Depends(get_db)):
    return AuthorRepository.get_all(db)
