import os
from typing import Dict, List

import requests
import urllib3

from backend.app.handlers.base import BaseHandler
from backend.app.schemas import AuthorCreate, Category, GenreCreate, MangaCreate


class JikanHandler(BaseHandler):
    def __init__(self, base_url: str = "https://api.jikan.moe/v4"):
        super().__init__(base_url)
        self.verify_ssl = os.getenv("DISABLE_SSL_VERIFY", "false").lower() != "true"
        if not self.verify_ssl:
            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    def search(self, search_term: str) -> List[MangaCreate]:
        search_url = f"{self.base_url}/manga"
        params = {"q": search_term, "limit": 10}
        response = requests.get(search_url, params=params, verify=self.verify_ssl)
        response.raise_for_status()

        data = response.json().get("data", [])
        results = []

        for item in data:
            # Map directly to MangaCreate
            manga = self._map_to_manga_create(item)
            results.append(manga)

        return results

    def scrape(self, url: str) -> MangaCreate:
        # url in this context is the mal_id passed from search results
        # If the user passes a full URL, we might need to parse it,
        # but based on MangaPassion implementation, the 'link' from search
        # is passed here.
        # In MangaPassion search: "link": f"{self.base_url}/editions/{manga_id}"
        # In Jikan search above: "link": str(mal_id)

        # So if url is just digits, treat it as ID.
        # If it's a full URL, try to extract ID?
        # Let's assume it's the ID for now as that's what we return in search.

        manga_id = url
        if url.startswith("http"):
            # If it's a full URL, we might need to handle it,
            # but for now let's assume ID
            pass

        api_url = f"{self.base_url}/manga/{manga_id}"
        response = requests.get(api_url, verify=self.verify_ssl)
        response.raise_for_status()

        data = response.json().get("data", {})
        return self._map_to_manga_create(data)

    def _map_to_manga_create(self, data: Dict) -> MangaCreate:
        title = data.get("title", "Unknown Title")
        title_japanese = data.get("title_japanese")
        synopsis = data.get("synopsis", "")

        # Map Category
        type_map = {
            "Manga": Category.manga,
            "One-shot": Category.manga,
            "Manhwa": Category.manga,
            "Manhua": Category.manga,
            "OEL": Category.manga,
            "Novel": Category.novel,
            "Light Novel": Category.novel,
            "Doujinshi": Category.doujinshi,
        }
        jikan_type = data.get("type")
        category = type_map.get(jikan_type, Category.manga)

        # Images
        images = data.get("images", {}).get("jpg", {})
        cover_image_url = images.get("large_image_url") or images.get("image_url")

        # Authors
        authors = []
        for author in data.get("authors", []):
            authors.append(author.get("name"))

        # Genres (include themes and demographics)
        genres = []
        for genre in data.get("genres", []):
            genres.append(genre.get("name"))
        for theme in data.get("themes", []):
            genres.append(theme.get("name"))
        for demo in data.get("demographics", []):
            genres.append(demo.get("name"))

        return MangaCreate(
            title=title,
            japanese_title=title_japanese,
            summary=synopsis,
            star_rating=None,
            category=category,
            cover_image=cover_image_url,
            authors=[AuthorCreate(name=author) for author in list(set(authors))],
            genres=[GenreCreate(name=genre) for genre in list(set(genres))],
            lists=[],
            volumes=[],
            language="EN",  # Jikan is primarily for English/International audience info
        )
