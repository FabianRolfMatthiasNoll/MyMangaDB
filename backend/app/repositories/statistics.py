from enum import Enum

from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from backend.app.models import (
    Author,
    Genre,
    List,
    Manga,
    Volume,
    manga_author,
    manga_genre,
)
from backend.app.schemas import StatisticCount, Statistics


class StatisticsRepository:
    @staticmethod
    def get_statistics(db: Session) -> Statistics:
        # Total Counts
        total_mangas = db.query(func.count(Manga.id)).scalar() or 0
        total_volumes = db.query(func.count(Volume.id)).scalar() or 0
        total_authors = db.query(func.count(Author.id)).scalar() or 0
        total_genres = db.query(func.count(Genre.id)).scalar() or 0
        total_lists = db.query(func.count(List.id)).scalar() or 0

        # Helper for distributions
        def get_distribution(model_field, transform_label=None):
            results = db.query(model_field, func.count()).group_by(model_field).all()

            dist_list = []
            for label, count in results:
                if transform_label:
                    label_str = transform_label(label)
                else:
                    label_str = "Unknown"
                    if label is not None:
                        if isinstance(label, Enum):
                            label_str = label.value
                        else:
                            label_str = str(label)
                dist_list.append(StatisticCount(label=label_str, count=count))
            return dist_list

        def rating_transform(label):
            if label == 0 or label is None:
                return "Unrated"
            return str(label)

        reading_status_dist = get_distribution(Manga.reading_status)
        overall_status_dist = get_distribution(Manga.overall_status)
        category_dist = get_distribution(Manga.category)
        rating_dist = get_distribution(
            Manga.star_rating, transform_label=rating_transform
        )

        # Top Lists
        top_genres = (
            db.query(Genre.name, func.count(manga_genre.c.manga_id))
            .join(manga_genre)
            .group_by(Genre.id)
            .order_by(desc(func.count(manga_genre.c.manga_id)))
            .limit(10)
            .all()
        )
        top_genres_list = [
            StatisticCount(label=name, count=count) for name, count in top_genres
        ]

        top_authors = (
            db.query(Author.name, func.count(manga_author.c.manga_id))
            .join(manga_author)
            .group_by(Author.id)
            .order_by(desc(func.count(manga_author.c.manga_id)))
            .limit(10)
            .all()
        )
        top_authors_list = [
            StatisticCount(label=name, count=count) for name, count in top_authors
        ]

        return Statistics(
            total_mangas=total_mangas,
            total_volumes=total_volumes,
            total_authors=total_authors,
            total_genres=total_genres,
            total_lists=total_lists,
            reading_status_distribution=reading_status_dist,
            overall_status_distribution=overall_status_dist,
            category_distribution=category_dist,
            rating_distribution=rating_dist,
            top_genres=top_genres_list,
            top_authors=top_authors_list,
        )
