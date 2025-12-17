from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.importers.mal import MALImporter
from backend.app.schemas import ImportResponse

router = APIRouter()


@router.post("/mal", response_model=ImportResponse)
async def import_mal_list(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    importer = MALImporter(db)
    return await importer.import_list(file)
