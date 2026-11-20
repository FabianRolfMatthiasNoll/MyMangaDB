"""Tests for the MangaPassion handler."""

from unittest.mock import patch

from backend.app.handlers.base import REQUEST_TIMEOUT
from backend.app.handlers.manga_passion import MangaPassionHandler


class _Response:
    def __init__(self, payload):
        self.payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self.payload


def _fake_get(url, **kwargs):
    if "search[desc]" in url:
        return _Response(
            [
                {"title": "One", "id": 1},
                {"title": "Two", "id": 2},
                {"title": "Three", "id": 3},
            ]
        )

    if url.endswith("/editions/2"):
        # One title that cannot be scraped must not take the whole search
        # down with it.
        raise RuntimeError("this title is broken")

    manga_id = url.rsplit("/", 1)[-1]
    return _Response(
        {
            "title": f"Title {manga_id}",
            "description": "Some text",
            "cover": "/cover.jpg",
            "sources": [
                {
                    "contributors": [{"contributor": {"name": "Someone"}}],
                    "tags": [{"name": "Action"}],
                }
            ],
        }
    )


def test_the_details_are_fetched_for_every_result():
    with patch("requests.get", side_effect=_fake_get):
        handler = MangaPassionHandler("https://example.com")
        results = handler.search("term")

    assert [manga.title for manga in results] == ["Title 1", "Title 3"]
    assert results[0].cover_image == "https://example.com/cover.jpg"
    assert [author.name for author in results[0].authors] == ["Someone"]


def test_every_request_has_a_timeout():
    # Without a timeout a request waits for the operating system to give
    # up, which can be minutes.
    with patch("requests.get", side_effect=_fake_get) as mock_get:
        handler = MangaPassionHandler("https://example.com")
        handler.search("term")

    assert mock_get.call_count == 4
    for call in mock_get.call_args_list:
        assert call.kwargs["timeout"] == REQUEST_TIMEOUT
