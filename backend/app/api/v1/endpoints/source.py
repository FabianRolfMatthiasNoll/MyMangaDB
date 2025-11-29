from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.handlers.factory import HandlerFactory
from backend.app.repositories.source import SourceRepository
from backend.app.schemas import MangaCreate, Source, SourceCreate

router = APIRouter()


@router.get("/getAll", response_model=List[Source])
def get_sources(db: Session = Depends(get_db)):
    sources = SourceRepository.get_all(db)
    return sources


@router.post("/create", response_model=Source)
def create_source(source: SourceCreate, db: Session = Depends(get_db)):
    db_source = SourceRepository.get_by_name(db, name=source.name)
    if db_source:
        raise HTTPException(status_code=400, detail="Source already exists")
    return SourceRepository.create(db, source)


@router.post("/search", response_model=List[MangaCreate])
def search_manga(title: str, source_name: str, db: Session = Depends(get_db)):
    source = SourceRepository.get_by_name(db, name=source_name)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    handler = HandlerFactory.get_handler(source_name)
    if not handler:
        raise HTTPException(
            status_code=400, detail="Handler not found for the given source"
        )

    search_results = handler.search(title)
    return search_results
