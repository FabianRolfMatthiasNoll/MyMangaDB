import os

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from backend.app.settings import IMAGE_SAVE_PATH

router = APIRouter()


@router.post("/manga/save")
async def save_manga_cover(file: UploadFile = File(...), filename: str = Form(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    file_path = os.path.join(IMAGE_SAVE_PATH, filename)

    # Ensure the directory exists
    os.makedirs(IMAGE_SAVE_PATH, exist_ok=True)

    # Save the file
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        return {"filename": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")


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
