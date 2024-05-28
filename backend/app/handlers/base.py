from abc import ABC, abstractmethod


class BaseHandler(ABC):
    def __init__(self, base_url):
        self.base_url = base_url

    @abstractmethod
    def search(self, search_term):
        pass

    @abstractmethod
    def scrape(self, url):
        pass
