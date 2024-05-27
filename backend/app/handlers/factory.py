# factory.py
from .manga_passion import MangaPassionHandler


class HandlerFactory:
    @staticmethod
    def get_handler(source: str):
        if source == "MangaPassion":
            # Specify the correct path to chromedriverC:\Users\Fabia\Documents
            chromedriver_path = (
                "C:\\Users\\Fabia\\Documents\\chromedriver.exe"  # Windows
            )
            # chromedriver_path = "/path/to/chromedriver"  # Linux
            return MangaPassionHandler(
                "https://www.manga-passion.de", chromedriver_path
            )
        raise ValueError(f"Handler for source '{source}' not found")
