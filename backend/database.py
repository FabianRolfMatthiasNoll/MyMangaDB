import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

docker_mode_value = os.getenv("DOCKER_MODE", "")
DOCKER_MODE = False if not docker_mode_value else docker_mode_value.lower() == "true"

if DOCKER_MODE:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./data/manga.db"
else:
    if sys.platform == "win32":  # For Windows
        appdata_path = os.getenv("APPDATA")  # Get APPDATA(Roaming) path
        db_path = os.path.join(appdata_path, "manga.db")
    elif sys.platform == "darwin":  # For macOS
        home_path = os.path.expanduser("~")  # Get home directory
        db_path = os.path.join(home_path, "Library", "Application Support", "manga.db")
    else:  # For Linux and others
        home_path = os.path.expanduser("~")
        db_path = os.path.join(home_path, ".config", "manga.db")

    SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()
