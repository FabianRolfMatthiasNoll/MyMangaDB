from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.repositories.statistics import StatisticsRepository
from backend.app.schemas import Statistics

router = APIRouter()


@router.get("/", response_model=Statistics)
def get_statistics(db: Session = Depends(get_db)):
    return StatisticsRepository.get_statistics(db)
