from sqlalchemy.orm import Session

from backend.app.models import (
    Author,
    Category,
    Genre,
    List,
    Manga,
    OverallStatus,
    ReadingStatus,
    Volume,
)
from backend.app.repositories.statistics import StatisticsRepository


def test_get_statistics(db_session: Session):
    # 1. Setup Data
    # Create Authors
    author1 = Author(name="Author One")
    author2 = Author(name="Author Two")
    db_session.add_all([author1, author2])
    db_session.commit()

    # Create Genres
    genre1 = Genre(name="Action")
    genre2 = Genre(name="Romance")
    db_session.add_all([genre1, genre2])
    db_session.commit()

    # Create Lists
    list1 = List(name="Favorites")
    db_session.add(list1)
    db_session.commit()

    # Create Mangas
    manga1 = Manga(
        title="Manga One",
        reading_status=ReadingStatus.completed,
        overall_status=OverallStatus.completed,
        category=Category.manga,
        star_rating=5.0,
    )
    manga1.authors.append(author1)
    manga1.genres.append(genre1)

    manga2 = Manga(
        title="Manga Two",
        reading_status=ReadingStatus.in_progress,
        overall_status=OverallStatus.ongoing,
        category=Category.manga,
        star_rating=4.0,
    )
    manga2.authors.append(author2)
    manga2.genres.append(genre2)

    manga3 = Manga(
        title="Manga Three",
        reading_status=ReadingStatus.not_started,
        overall_status=OverallStatus.ongoing,
        category=Category.novel,
        star_rating=None,  # Unrated
    )
    # No authors or genres for manga3 to test counts

    db_session.add_all([manga1, manga2, manga3])
    db_session.commit()

    # Create Volumes
    # Manga 1 has 2 volumes
    vol1 = Volume(volume_number="1", manga_id=manga1.id)
    vol2 = Volume(volume_number="2", manga_id=manga1.id)
    # Manga 2 has 1 volume
    vol3 = Volume(volume_number="1", manga_id=manga2.id)

    db_session.add_all([vol1, vol2, vol3])
    db_session.commit()

    # 2. Execute
    stats = StatisticsRepository.get_statistics(db_session)

    # 3. Assertions

    # Total Counts
    assert stats.total_mangas == 3
    assert stats.total_volumes == 3
    assert stats.total_authors == 2
    assert stats.total_genres == 2
    assert stats.total_lists == 1

    # Distributions

    # Reading Status
    # completed: 1, in_progress: 1, not_started: 1
    reading_map = {item.label: item.count for item in stats.reading_status_distribution}
    assert reading_map["completed"] == 1
    assert reading_map["in_progress"] == 1
    assert reading_map["not_started"] == 1

    # Overall Status
    # completed: 1, ongoing: 2
    overall_map = {item.label: item.count for item in stats.overall_status_distribution}
    assert overall_map["completed"] == 1
    assert overall_map["ongoing"] == 2

    # Category
    # manga: 2, novel: 1
    category_map = {item.label: item.count for item in stats.category_distribution}
    assert category_map["manga"] == 2
    assert category_map["novel"] == 1

    # Rating
    # 5.0: 1, 4.0: 1, Unrated: 1
    rating_map = {item.label: item.count for item in stats.rating_distribution}
    assert rating_map["5.0"] == 1
    assert rating_map["4.0"] == 1
    assert rating_map["Unrated"] == 1

    # Top Genres (Just check if they exist)
    top_genres_labels = [item.label for item in stats.top_genres]
    assert "Action" in top_genres_labels
    assert "Romance" in top_genres_labels

    # Top Authors
    top_authors_labels = [item.label for item in stats.top_authors]
    assert "Author One" in top_authors_labels
    assert "Author Two" in top_authors_labels
