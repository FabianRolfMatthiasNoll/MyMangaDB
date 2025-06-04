from typing import List as TypedList
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.schemas import ListCreate, ListModel
from backend.app.repositories.list import ListRepository
from backend.app.database import get_db

router = APIRouter()


@router.get("/getAll", response_model=TypedList[ListModel])
def get_lists(db: Session = Depends(get_db)):
    return ListRepository.get_all(db)


@router.get("/{list_id}", response_model=ListModel)
def get_list(list_id: int, db: Session = Depends(get_db)):
    list_ = ListRepository.get_by_id(db, list_id)
    if not list_:
        raise HTTPException(status_code=404, detail="List not found")
    return list_


@router.post("/create", response_model=ListModel)
def create_list(list_create: ListCreate, db: Session = Depends(get_db)):
    try:
        return ListRepository.create(db, list_create)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{list_id}", response_model=ListModel)
def update_list(list_id: int, list_data: ListCreate, db: Session = Depends(get_db)):
    try:
        return ListRepository.update(db, list_id, list_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{list_id}", response_model=ListModel)
def delete_list(list_id: int, db: Session = Depends(get_db)):
    try:
        return ListRepository.delete(db, list_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/getAll/withCount", response_model=TypedList[dict])
def get_lists_with_count(db: Session = Depends(get_db)):
    return ListRepository.get_with_manga_count(db)
