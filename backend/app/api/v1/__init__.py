from fastapi import APIRouter

from .endpoints import manga, source, author, genre

api_router = APIRouter()
api_router.include_router(manga.router, prefix="/mangas", tags=["Mangas"])
api_router.include_router(source.router, prefix="/sources", tags=["Sources"])
api_router.include_router(author.router, prefix="/authors", tags=["Authors"])
api_router.include_router(genre.router, prefix="/genres", tags=["Genres"])
