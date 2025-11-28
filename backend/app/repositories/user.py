from typing import Optional

from sqlalchemy.orm import Session

from backend.app.core.security import get_password_hash
from backend.app.models import User
from backend.app.repositories.base import BaseRepository
from backend.app.schemas import UserCreate


class UserRepository(BaseRepository):
    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def create(db: Session, user: UserCreate) -> User:
        hashed_password = get_password_hash(user.password)
        db_user = User(
            username=user.username, hashed_password=hashed_password, role=user.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def update_password(db: Session, user: User, password: str) -> User:
        user.hashed_password = get_password_hash(password)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
