from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1 import api_router
from . import models
from .database import engine
from backend.config import get_default_paths, save_config, get_config_path
from .repositories.source import SourceRepository
from .schemas import SourceCreate
from sqlalchemy.orm import Session
from .database import SessionLocal
import os

def initialize_application():
    # Only create default config if none exists
    if not os.path.exists(get_config_path()):
        config = get_default_paths()
        save_config(config)
    else:
        config = get_default_paths()  # Still need this for directory creation
    
    # Create database directory if it doesn't exist
    db_dir = os.path.dirname(config["database_path"])
    os.makedirs(db_dir, exist_ok=True)
    
    # Create images directory if it doesn't exist
    os.makedirs(config["image_path"], exist_ok=True)
    
    # Create database tables
    models.Base.metadata.create_all(bind=engine)
    
    # Initialize default sources if they don't exist
    db = SessionLocal()
    try:
        sources = SourceRepository.get_all(db)
        if not sources:
            # Add default sources
            default_sources = [
                SourceCreate(name="MangaPassion", language="DE")
            ]
            for source in default_sources:
                SourceRepository.create(db, source)
    finally:
        db.close()

# Initialize FastAPI app
app = FastAPI()

# Allow all CORS origins for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

# Initialize application on startup
@app.on_event("startup")
async def startup_event():
    initialize_application()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Manga API"}
