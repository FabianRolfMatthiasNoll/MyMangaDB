from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.repositories.list import ListRepository
from backend.app.schemas import ListCreate, ListModel

router = APIRouter()


@router.get("/getAll", response_model=List[ListModel])
def get_mangas(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return ListRepository.get_all(db)


@router.post("/create", response_model=ListModel)
def create_list(list: ListCreate, db: Session = Depends(get_db)):
    return ListRepository.create(db, list)
