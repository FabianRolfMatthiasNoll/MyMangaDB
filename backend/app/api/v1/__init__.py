from fastapi import APIRouter
from .endpoints import manga

api_router = APIRouter()
api_router.include_router(manga.router, prefix="/mangas", tags=["Mangas"])
