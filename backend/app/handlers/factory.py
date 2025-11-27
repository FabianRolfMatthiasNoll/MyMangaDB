# factory.py
from .manga_passion import MangaPassionHandler
from .jikan import JikanHandler


class HandlerFactory:
    @staticmethod
    def get_handler(source: str):
        if source == "MangaPassion":
            return MangaPassionHandler("https://api.manga-passion.de")
        elif source == "Jikan":
            return JikanHandler()
        raise ValueError(f"Handler for source '{source}' not found")
