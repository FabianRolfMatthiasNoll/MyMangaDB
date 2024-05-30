# factory.py
from .manga_passion import MangaPassionHandler


class HandlerFactory:
    @staticmethod
    def get_handler(source: str):
        if source == "MangaPassion":
            return MangaPassionHandler("https://api.manga-passion.de")
        raise ValueError(f"Handler for source '{source}' not found")
