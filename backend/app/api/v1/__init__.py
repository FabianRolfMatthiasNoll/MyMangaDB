from fastapi import APIRouter

from .endpoints import author, database, genre, image, list, manga, settings, source

api_router = APIRouter()
api_router.include_router(manga.router, prefix="/mangas", tags=["Mangas"])
api_router.include_router(source.router, prefix="/sources", tags=["Sources"])
api_router.include_router(author.router, prefix="/authors", tags=["Authors"])
api_router.include_router(genre.router, prefix="/genres", tags=["Genres"])
api_router.include_router(image.router, prefix="/images", tags=["Images"])
api_router.include_router(list.router, prefix="/lists", tags=["Lists"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
api_router.include_router(database.router, prefix="/database", tags=["Database"])
