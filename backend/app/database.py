import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from ..config import DATABASE_PATH

docker_mode_value = os.getenv("DOCKER_MODE", "")
DOCKER_MODE = docker_mode_value.lower() == "true"

if DOCKER_MODE:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./data/MyMangaDB.db"
else:
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
