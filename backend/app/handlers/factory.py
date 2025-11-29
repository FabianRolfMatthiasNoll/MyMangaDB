# factory.py
from .jikan import JikanHandler
from .manga_passion import MangaPassionHandler


class HandlerFactory:
    @staticmethod
    def get_handler(source: str):
        if source == "MangaPassion":
            return MangaPassionHandler("https://api.manga-passion.de")
        elif source == "Jikan":
            return JikanHandler()
        raise ValueError(f"Handler for source '{source}' not found")
