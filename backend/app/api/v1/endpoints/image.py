from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
from backend.app.settings import IMAGE_SAVE_PATH

router = APIRouter()


@router.get("/manga/{filename}")
def get_manga_cover_image(filename: str):
    file_path = os.path.join(IMAGE_SAVE_PATH, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)


@router.get("/volume/{filename}")
def get_volume_cover_image(filename: str):
    file_path = os.path.join(IMAGE_SAVE_PATH, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)
