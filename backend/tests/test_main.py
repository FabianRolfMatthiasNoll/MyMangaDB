import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_read_root(client: AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Manga API"}


@pytest.mark.asyncio
async def test_get_sources(client: AsyncClient):
    response = await client.get("/api/v1/sources/getAll")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    names = [source["name"] for source in data]
    assert "MangaPassion" in names
    assert "Jikan" in names
