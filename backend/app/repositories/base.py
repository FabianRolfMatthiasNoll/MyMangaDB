from typing import Any, Type

from sqlalchemy.orm import Session


class RepositoryError(Exception):
    """Custom exception for repository errors."""

    pass


class BaseRepository:
    @staticmethod
    def commit_session(db: Session) -> None:
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            raise RepositoryError("Database commit failed") from e

    @staticmethod
    def flush_and_return(db: Session, instance: Any) -> Any:
        db.flush()
        return instance

    @staticmethod
    def find_or_create(db: Session, model: Type[Any], field: Any, value: Any) -> Any:
        """
        Check if an entity exists (by the given field) and return it;
        otherwise create a new instance.
        """
        instance = db.query(model).filter(field == value).first()
        if instance:
            return instance
        # Support both simple values and objects with model_dump()
        # (e.g. Pydantic models)
        if hasattr(value, "model_dump"):
            data = value.model_dump()
        elif isinstance(value, dict):
            data = value
        else:
            # Assume a simple value; use the field name as key.
            data = {field.key: value}
        instance = model(**data)
        db.add(instance)
        return BaseRepository.flush_and_return(db, instance)
