from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models import Base, Author, Genre
from app.database import SQLALCHEMY_DATABASE_URL

def update_database():
    # Create engine and session
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Add new columns using text() for raw SQL
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE authors ADD COLUMN manga_count INTEGER DEFAULT 0"))
            conn.execute(text("ALTER TABLE genres ADD COLUMN manga_count INTEGER DEFAULT 0"))
            conn.commit()

        # Update counts for authors
        authors = db.query(Author).all()
        for author in authors:
            author.manga_count = len(author.mangas)
        
        # Update counts for genres
        genres = db.query(Genre).all()
        for genre in genres:
            genre.manga_count = len(genre.mangas)
        
        # Commit changes
        db.commit()
        print("Database updated successfully!")

    except Exception as e:
        print(f"Error updating database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_database()
