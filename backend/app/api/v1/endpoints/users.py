from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.database import get_db
from backend.app.models import User
from backend.app.repositories import UserRepository
from backend.app.schemas import UserUpdatePassword

router = APIRouter()


@router.post("/change-password", response_model=Any)
def change_password(
    user_update: UserUpdatePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Change password for a user. Only accessible by admin.
    """
    user = UserRepository.get_by_username(db, username=user_update.username)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    UserRepository.update_password(db, user, user_update.password)
    return {"message": "Password updated successfully"}
