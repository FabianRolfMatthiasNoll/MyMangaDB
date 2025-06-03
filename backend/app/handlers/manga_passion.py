import requests
from typing import Dict, List
from urllib.parse import urljoin
from backend.app.schemas import AuthorCreate, Category, GenreCreate, MangaCreate
from backend.app.handlers.base import BaseHandler


class MangaPassionHandler(BaseHandler):
    def __init__(self, base_url: str):
        super().__init__(base_url)

    def search(self, search_term: str) -> List[Dict[str, str]]:
        search_url = (
            f"{self.base_url}/editions?search[desc]={search_term}&itemsPerPage=10&page=1"
        )
        response = requests.get(search_url)
        response.raise_for_status()

        data = response.json()
        results = []

        for item in data:
            title = item.get("title")
            manga_id = item.get("id")
            if title and manga_id:
                results.append(
                    {"title": title, "link": f"{self.base_url}/editions/{manga_id}"}
                )

        return results

    def scrape(self, url: str) -> MangaCreate:
        response = requests.get(url)
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
