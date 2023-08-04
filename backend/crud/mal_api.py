import base64
import requests
import config

from io import BytesIO
from typing import List
from PIL import Image
from fastapi import HTTPException
from sqlalchemy.orm import Session
from schema import Manga, Author, Genre

# TODO: Check if still needed in the future. Probably deprecated
def get_manga_from_mal(manga_title: str) -> Manga:
    url = "https://api.myanimelist.net/v2/manga"
    headers = {"Authorization": f"Bearer {config.MYANIMELIST_ACCESS_TOKEN}"}
    params = {
        "q": manga_title,
        "limit": 10,
        "fields": "title,authors{first_name,last_name},synopsis,main_picture,num_volumes,genres",
    }
    response = requests.get(url, headers=headers, params=params)
    results = response.json().get("data", [])

    results = [r for r in results if r["node"]["title"].lower() == manga_title.lower()]
    if len(results) == 0:
        raise HTTPException(status_code=404, detail="Manga not found")
    manga_data = results[0]
    authors: List[Author] = []
    for author in manga_data["node"]["authors"]:
        author_first_name = author["node"]["first_name"]
        author_last_name = author["node"]["last_name"]
        author_name = f"{author_first_name} {author_last_name}"
        author_data = {"id": 0, "name": author_name, "role": author["role"]}
        author_model = Author(**author_data)
        authors.append(author_model)
    genres: List[Genre] = []
    for genre in manga_data["node"]["genres"]:
        genre_data = {"id": 0, "name": genre["name"]}
        genre_model = Genre(**genre_data)
        genres.append(genre_model)

    cover_image_url = manga_data["node"]["main_picture"]["large"]

    manga = Manga(
        id=0,
        title=manga_data["node"]["title"],
        genres=genres,
        authors=authors,
        total_volumes=manga_data["node"]["num_volumes"],
        description=manga_data["node"]["synopsis"],
        volumes=[],
        cover_image=get_image_base64(cover_image_url),
    )

    return manga


def get_search_results_from_mal(manga_title: str) -> List[Manga]:
    url = "https://api.myanimelist.net/v2/manga"
    headers = {"Authorization": f"Bearer {config.MYANIMELIST_ACCESS_TOKEN}"}
    params = {
        "q": manga_title,
        "limit": 10,
        "fields": "title,authors{first_name,last_name},synopsis,main_picture,num_volumes,genres",
    }
    response = requests.get(url, headers=headers, params=params)
    results = response.json().get("data", [])

    if len(results) == 0:
        raise HTTPException(status_code=404, detail="Manga not found")

    mangas: List[Manga] = []

    for manga_data in results:
        authors: List[Author] = []
        for author in manga_data["node"]["authors"]:
            author_first_name = author["node"]["first_name"]
            author_last_name = author["node"]["last_name"]
            author_name = f"{author_first_name} {author_last_name}"
            author_data = {"id": 0, "name": author_name, "role": author["role"]}
            author_model = Author(**author_data)
            authors.append(author_model)
        genres: List[Genre] = []
        for genre in manga_data["node"]["genres"]:
            genre_data = {"id": 0, "name": genre["name"]}
            genre_model = Genre(**genre_data)
            genres.append(genre_model)

        cover_image_url = manga_data["node"]["main_picture"]["large"]

        manga = Manga(
            id=0,
            title=manga_data["node"]["title"],
            genres=genres,
            authors=authors,
            total_volumes=manga_data["node"]["num_volumes"],
            description=manga_data["node"]["synopsis"],
            volumes=[],
            cover_image=get_image_base64(cover_image_url),
        )
        mangas.append(manga)

    return mangas


def get_image_binary(url):
    response = requests.get(url)
    if response.status_code == 200:
        image_binary = BytesIO(response.content).getvalue()
        return image_binary
    else:
        print(f"Failed to download image from URL: {url}")
        return None


def get_image_base64(url):
    response = requests.get(url)
    if response.status_code == 200:
        image_binary = BytesIO(response.content).getvalue()
        image_base64 = base64.b64encode(image_binary).decode("utf-8")
        return image_base64
    else:
        print(f"Failed to download image from URL: {url}")
        return None
