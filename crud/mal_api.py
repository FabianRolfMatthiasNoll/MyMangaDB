from typing import List

from fastapi import HTTPException
from sqlalchemy.orm import Session
import requests

import config
import models
import schema


def get_manga_from_mal(manga_title: str) -> schema.Manga:
    url = "https://api.myanimelist.net/v2/manga"
    headers = {
        "Authorization": f"Bearer {config.MYANIMELIST_ACCESS_TOKEN}"
    }
    params = {
        "q": manga_title,
        "limit": 10,
        "fields": "title,authors{first_name,last_name},synopsis,main_picture,num_volumes,genres"
    }
    response = requests.get(url, headers=headers, params=params)
    results = response.json().get("data", [])

    # Filter search results based on title
    # TODO: check for light novel vs manga
    results = [r for r in results if r["node"]["title"].lower() == manga_title.lower()]
    if len(results) == 0:
        raise HTTPException(
            status_code=404,
            detail="Manga not found"
        )
    manga_data = results[0]
    authors: List[schema.Author] = []
    for author in manga_data["node"]["authors"]:
        author_first_name = author["node"]["first_name"]
        author_last_name = author["node"]["last_name"]
        author_name = f"{author_first_name} {author_last_name}"
        author_data = {
            "name": author_name,
            "role": author["role"]
        }
        author_model = schema.Author(**author_data)
        authors.append(author_model)
    genres: List[schema.Genre] = []
    for genre in manga_data["node"]["genres"]:
        genre_data = {
            "name": genre["name"]
        }
        genre_model = schema.Genre(**genre_data)
        genres.append(genre_model)

    manga = schema.Manga(
        title=manga_title,
        genres=genres,
        authors=authors,
        total_volumes=manga_data["node"]["num_volumes"],
        description=manga_data["node"]["synopsis"],
        volumes=[],
    )
    return manga
