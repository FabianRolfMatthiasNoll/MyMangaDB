import os
from concurrent.futures import ThreadPoolExecutor
from typing import List, Optional
from urllib.parse import urljoin

import requests
import urllib3

from backend.app.handlers.base import REQUEST_TIMEOUT, SCRAPE_WORKERS, BaseHandler
from backend.app.schemas import AuthorCreate, Category, GenreCreate, MangaCreate


class MangaPassionHandler(BaseHandler):
    def __init__(self, base_url: str):
        super().__init__(base_url)
        self.verify_ssl = os.getenv("DISABLE_SSL_VERIFY", "false").lower() != "true"
        if not self.verify_ssl:
            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    def search(self, search_term: str) -> List[MangaCreate]:
        search_url = (
            f"{self.base_url}/editions?"
            f"search[desc]={search_term}&itemsPerPage=10&page=1"
        )
        response = requests.get(
            search_url, verify=self.verify_ssl, timeout=REQUEST_TIMEOUT
        )
        response.raise_for_status()

        data = response.json()
        links = []

        for item in data:
            title = item.get("title")
            manga_id = item.get("id")
            if title and manga_id:
                links.append(f"{self.base_url}/editions/{manga_id}")

        # The search results only carry a title, so the details have to be
        # fetched for each of them. They do not depend on each other, so
        # they are fetched at the same time instead of one after another.
        with ThreadPoolExecutor(max_workers=SCRAPE_WORKERS) as pool:
            scraped = list(pool.map(self._scrape_or_none, links))

        return [manga for manga in scraped if manga is not None]

    def _scrape_or_none(self, url: str) -> Optional[MangaCreate]:
        """Scrape one title, skipping it when that fails."""
        try:
            return self.scrape(url)
        except Exception:
            return None

    def scrape(self, url: str) -> MangaCreate:
        response = requests.get(url, verify=self.verify_ssl, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()

        data = response.json()

        title = data.get("title", "Unknown Title")
        description = data.get("description", "")

        sources = data.get("sources", [])

        authors = []
        genres = []

        if sources:
            contributors = sources[0].get("contributors", [])
            for contributor in contributors:
                authors.append(contributor["contributor"]["name"])
            genres = [tag["name"] for tag in sources[0].get("tags", [])]

        cover_image_url = data.get("cover")
        if cover_image_url:
            cover_image_url = urljoin(self.base_url, cover_image_url)

        manga_create = MangaCreate(
            title=title,
            japanese_title=None,
            summary=description,
            star_rating=None,
            category=Category.manga,
            cover_image=cover_image_url,
            authors=[AuthorCreate(name=author) for author in list(set(authors))],
            genres=[GenreCreate(name=genre) for genre in genres],
            lists=[],
            volumes=[],
        )

        return manga_create
