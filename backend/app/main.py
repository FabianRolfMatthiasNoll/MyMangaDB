from fastapi import FastAPI, Request, HTTPException
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
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Get the absolute path to the backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BACKEND_DIR / '.env'

# Load environment variables from .env file
logger.debug(f"Looking for .env file at: {ENV_PATH}")
load_dotenv(dotenv_path=ENV_PATH, verbose=True)
logger.debug(f"API_TOKEN loaded: {os.getenv('API_TOKEN') is not None}")
logger.debug(f"FRONTEND_URL loaded: {os.getenv('FRONTEND_URL')}")

class APIKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip API key check for OPTIONS requests (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)
            
        # Skip API key check for OpenAPI schema endpoints
        if request.url.path in ["/openapi.json", "/docs", "/redoc"]:
            return await call_next(request)
            
        # Get API key from environment
        api_key = os.getenv("API_TOKEN")
        if not api_key:
            logger.error("API_TOKEN not found in environment variables")
            raise HTTPException(status_code=500, detail="API token not configured")
            
        # Get API key from request header
        request_api_key = request.headers.get("X-API-Key")
        if not request_api_key or request_api_key != api_key:
            logger.error(f"Invalid API key received: {request_api_key}")
            raise HTTPException(status_code=401, detail="Invalid API key")
            
        return await call_next(request)

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
    
    # Initialize default sources
    db = SessionLocal()
    try:
        existing_sources = {s.name for s in SourceRepository.get_all(db)}
        
        default_sources = [
            SourceCreate(name="MangaPassion", language="DE"),
            SourceCreate(name="Jikan", language="EN")
        ]
        
        for source in default_sources:
            if source.name not in existing_sources:
                SourceRepository.create(db, source)
    finally:
        db.close()


# Initialize FastAPI app
app = FastAPI()

# Get frontend URL from environment
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")  # Updated to Vite's default port

# Configure CORS with specific origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add API key middleware
app.add_middleware(APIKeyMiddleware)

app.include_router(api_router, prefix="/api/v1")


# Initialize application on startup
@app.on_event("startup")
async def startup_event():
    initialize_application()


@app.get("/")
def read_root():
    return {"message": "Welcome to the Manga API"}
