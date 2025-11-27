from abc import ABC, abstractmethod
from typing import List
from backend.app.schemas import MangaCreate


class BaseHandler(ABC):
    def __init__(self, base_url):
        self.base_url = base_url

    @abstractmethod
    def search(self, search_term: str) -> List[MangaCreate]:
        pass

    @abstractmethod
    def scrape(self, url: str) -> MangaCreate:
        pass
