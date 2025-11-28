import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import get_config_path, get_default_paths, save_config

from . import models
from .api.v1 import api_router
from .database import SessionLocal, engine
from .models import Role
from .repositories import UserRepository
from .repositories.source import SourceRepository
from .schemas import SourceCreate, UserCreate

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Get the absolute path to the backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BACKEND_DIR / ".env"

# Load environment variables from .env file
logger.debug(f"Looking for .env file at: {ENV_PATH}")
load_dotenv(dotenv_path=ENV_PATH, verbose=True)
logger.debug(f"API_TOKEN loaded: {os.getenv('API_TOKEN') is not None}")
logger.debug(f"FRONTEND_URL loaded: {os.getenv('FRONTEND_URL')}")


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

    # Initialize default sources and users
    db = SessionLocal()
    try:
        existing_sources = {s.name for s in SourceRepository.get_all(db)}

        default_sources = [
            SourceCreate(name="MangaPassion", language="DE"),
            SourceCreate(name="Jikan", language="EN"),
        ]

        for source in default_sources:
            if source.name not in existing_sources:
                SourceRepository.create(db, source)

        # Init Admin
        if not UserRepository.get_by_username(db, "admin"):
            UserRepository.create(
                db,
                UserCreate(username="admin", password="admin", role=Role.admin),
            )

        # Init Guest
        if not UserRepository.get_by_username(db, "guest"):
            UserRepository.create(
                db,
                UserCreate(username="guest", password="guest", role=Role.guest),
            )
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Startup event triggered")
    initialize_application()
    yield
    print("Shutdown event triggered")


# Initialize FastAPI app
app = FastAPI(lifespan=lifespan)

# Get frontend URL from environment
frontend_url = os.getenv(
    "FRONTEND_URL", "http://localhost:5173"
)  # Updated to Vite's default port

# Configure CORS with specific origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {"message": "Welcome to the Manga API"}
