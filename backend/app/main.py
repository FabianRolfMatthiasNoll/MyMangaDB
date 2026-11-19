import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import get_config_path, get_default_paths, save_config

from .api.v1 import api_router
from .core import security
from .database import SessionLocal, engine
from .migrations import run_migrations
from .models import Role
from .repositories import UserRepository
from .repositories.source import SourceRepository
from .schemas import SourceCreate, UserCreate

# Configure logging. INFO keeps the startup messages without the DEBUG noise:
# at DEBUG level SQLAlchemy logs every single statement and the library
# prints the environment it was handed.
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the absolute path to the backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BACKEND_DIR / ".env"

# Load environment variables from .env file. The file is already loaded by
# the ``backend`` package itself (before any module reads a setting), this
# call only makes the outcome visible in the logs.
load_dotenv(dotenv_path=ENV_PATH)


def initialize_application():
    # Fail closed: refuse to start when no usable signing key is available.
    # A missing or publicly known key would allow anybody to forge an admin
    # session token (GHSA-2223-v44q-q2hc).
    try:
        security.get_secret_key()
    except RuntimeError as exc:
        raise RuntimeError(f"MyMangaDB cannot start: {exc}") from exc
    logger.info(f"JWT signing key source: {security.get_secret_key_source()}")

    if os.getenv("DOCKER_MODE", "").lower() == "true":
        # In Docker, the volume mount at /app/data is what persists state.
        # Ensure the directories exist (the volume itself is mounted by
        # compose; this just guards against an empty initial mount).
        os.makedirs("/app/data", exist_ok=True)
        os.makedirs("/app/data/images", exist_ok=True)
        config = {
            "database_path": "/app/data/MyMangaDB.db",
            "image_path": "/app/data/images",
        }
    else:
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

    # Bring the schema up to date. This replaces the old
    # ``create_all`` call: the schema is owned by the Alembic migrations now,
    # so an existing database is upgraded instead of being left behind.
    run_migrations(engine)

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

        # Warn as long as the well known default credentials are in place.
        for username, default_password in (("admin", "admin"), ("guest", "guest")):
            user = UserRepository.get_by_username(db, username)
            if user and security.verify_password(
                default_password, user.hashed_password
            ):
                logger.warning(
                    "The '%s' account still uses the default password - change it "
                    "immediately, otherwise the account can be taken over with a "
                    "simple guess.",
                    username,
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

# Define allowed origins
origins = [
    frontend_url,
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Configure CORS with specific origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {"message": "Welcome to the Manga API"}
