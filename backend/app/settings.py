import os

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from ..config import IMAGE_PATH
from .database import DOCKER_MODE, SQLALCHEMY_DATABASE_URL


def get_image_path():
    # Create a temporary engine to read settings
    temp_engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=temp_engine)
    db = SessionLocal()

    try:
        # Try to get image path from settings
        result = db.execute(
            text("SELECT value FROM settings WHERE key = 'image_path'")
        ).first()
        if result:
            return result[0]
    except Exception:
        pass
    finally:
        db.close()

    # Fallback to default path if settings not found
    if DOCKER_MODE:
        return os.path.abspath("./data/images")
    return os.path.abspath("./images")


if DOCKER_MODE:
    IMAGE_SAVE_PATH = os.path.abspath("./data/images")
else:
    IMAGE_SAVE_PATH = IMAGE_PATH
