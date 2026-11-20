from abc import ABC, abstractmethod
from typing import List

from backend.app.schemas import MangaCreate

# (connect, read) timeout in seconds for the calls to a data source.
#
# Without a timeout a request waits for the operating system to give up,
# which can be minutes. A search that hangs is worse than a search that
# fails with a message.
REQUEST_TIMEOUT = (5, 15)

# How many details are scraped at the same time. The details of a search
# result are independent of each other, so there is no reason to fetch them
# one after another.
SCRAPE_WORKERS = 4


class BaseHandler(ABC):
    def __init__(self, base_url):
        self.base_url = base_url

    @abstractmethod
    def search(self, search_term: str) -> List[MangaCreate]:
        pass

    @abstractmethod
    def scrape(self, url: str) -> MangaCreate:
        pass
