import os
from typing import List

from fastapi import HTTPException
from sqlalchemy.orm import Session
import requests

import config
from schema import Manga, Author, Genre

# TODO: save images in db


def get_manga_from_mal(manga_title: str) -> Manga:
    url = "https://api.myanimelist.net/v2/manga"
    headers = {"Authorization": f"Bearer {config.MYANIMELIST_ACCESS_TOKEN}"}
    params = {
        "q": manga_title,
        "limit": 10,
        "fields": "title,authors{first_name,last_name},synopsis,main_picture,num_volumes,genres",
    }
    # TODO: Return list of results and choose which one to send to create manga.
    response = requests.get(url, headers=headers, params=params)
    results = response.json().get("data", [])

    # Filter search results based on title
    # TODO: check for light novel vs manga
    results = [r for r in results if r["node"]["title"].lower() == manga_title.lower()]
    if len(results) == 0:
        raise HTTPException(status_code=404, detail="Manga not found")
    manga_data = results[0]
    authors: List[Author] = []
    for author in manga_data["node"]["authors"]:
        author_first_name = author["node"]["first_name"]
        author_last_name = author["node"]["last_name"]
        author_name = f"{author_first_name} {author_last_name}"
        author_data = {"name": author_name, "role": author["role"]}
        author_model = Author(**author_data)
        authors.append(author_model)
    genres: List[Genre] = []
    for genre in manga_data["node"]["genres"]:
        genre_data = {"name": genre["name"]}
        genre_model = Genre(**genre_data)
        genres.append(genre_model)

    manga = Manga(
        title=manga_data["node"]["title"],
        genres=genres,
        authors=authors,
        total_volumes=manga_data["node"]["num_volumes"],
        description=manga_data["node"]["synopsis"],
        volumes=[],
    )

    # Download and save the manga cover image
    cover_image_url = manga_data["node"]["main_picture"]["large"]
    cover_image_name = f"{manga_title}_cover.jpg"

    # Replace with your desired download location
    download_location = "../../frontend/public/static/images"
    cover_image_path = os.path.join(download_location, cover_image_name)

    try:
        download_image(cover_image_url, cover_image_path)
        print(f"Cover image downloaded to {cover_image_path}")
    except Exception as e:
        print(f"Failed to download cover image: {e}")

    return manga


def get_search_results_from_mal(manga_title: str) -> List[Manga]:
    url = "https://api.myanimelist.net/v2/manga"
    headers = {"Authorization": f"Bearer {config.MYANIMELIST_ACCESS_TOKEN}"}
    params = {
        "q": manga_title,
        "limit": 10,
        "fields": "title,authors{first_name,last_name},synopsis,main_picture,num_volumes,genres",
    }
    # TODO: Return list of results and choose which one to send to create manga.
    response = requests.get(url, headers=headers, params=params)
    results = response.json().get("data", [])

    # Filter search results based on title
    # TODO: check for light novel vs manga
    if len(results) == 0:
        raise HTTPException(status_code=404, detail="Manga not found")

    mangas: List[Manga] = []

    for manga_data in results:
        authors: List[Author] = []
        for author in manga_data["node"]["authors"]:
            author_first_name = author["node"]["first_name"]
            author_last_name = author["node"]["last_name"]
            author_name = f"{author_first_name} {author_last_name}"
            author_data = {"name": author_name, "role": author["role"]}
            author_model = Author(**author_data)
            authors.append(author_model)
        genres: List[Genre] = []
        for genre in manga_data["node"]["genres"]:
            genre_data = {"name": genre["name"]}
            genre_model = Genre(**genre_data)
            genres.append(genre_model)

        manga = Manga(
            title=manga_data["node"]["title"],
            genres=genres,
            authors=authors,
            total_volumes=manga_data["node"]["num_volumes"],
            description=manga_data["node"]["synopsis"],
            volumes=[],
        )
        mangas.append(manga)

    return mangas


def download_image(url: str, save_path: str) -> None:
    response = requests.get(url)
    if response.status_code == 200:
        with open(save_path, "wb") as f:
            f.write(response.content)
    else:
        raise Exception(
            f"Failed to download image. Status code: {response.status_code}"
        )
