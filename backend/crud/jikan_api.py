import base64
import requests
import config

from io import BytesIO
from typing import List
from PIL import Image
from fastapi import HTTPException
from sqlalchemy.orm import Session
from schema import Manga, Author, Genre


def get_image_base64(url):
    response = requests.get(url)
    if response.status_code == 200:
        image_binary = BytesIO(response.content).getvalue()
        image_base64 = base64.b64encode(image_binary).decode("utf-8")
        return image_base64
    else:
        print(f"Failed to download image from URL: {url}")
        return None


def get_search_results_from_jikan(manga_title: str) -> List[Manga]:
    search_url = f"https://api.jikan.moe/v4/manga?q={manga_title}&limit=10"
    search_response = requests.get(search_url, verify=False)
    search_results = search_response.json().get("data", [])
    if len(search_results) == 0:
        raise HTTPException(status_code=404, detail="Manga not found")

    mangas: List[Manga] = []

    for search_result in search_results:
        authors: List[Author] = []
        for author in search_result["authors"]:
            author_data = {
                "id": author["id"],
                "name": author["name"],
            }
            author_model = Author(**author_data)
            authors.append(author_model)

        genres: List[Genre] = []
        for genre_type in ["genres", "themes", "demographics"]:
            for genre in search_result[genre_type]:
                genre_data = {"id": genre["id"], "name": genre["name"]}
                genre_model = Genre(**genre_data)
                genres.append(genre_model)

        cover_image_url = search_result["images"]["cover_image"]

        manga = Manga(
            id=search_result["id"],
            title=search_result["title"],
            genres=genres,
            authors=authors,
            total_volumes=search_result["num_volumes"],
            description=search_result["synopsis"],
            volumes=[],  # Jikan API v4 doesn't provide volume data
            cover_image=get_image_base64(cover_image_url),
            reading_status="not_set",
            collection_status="not_set",
        )
        mangas.append(manga)

    return mangas
