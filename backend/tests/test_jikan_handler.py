from unittest.mock import patch

from backend.app.handlers.base import REQUEST_TIMEOUT
from backend.app.handlers.jikan import JikanHandler


def test_jikan_search():
    mock_response_data = {
        "data": [
            {
                "mal_id": 1,
                "title": "Naruto",
                "title_english": "Naruto",
                "synopsis": "Ninja stuff",
                "chapters": 700,
                "volumes": 72,
                "status": "Finished",
                "type": "Manga",
                "images": {"jpg": {"image_url": "http://example.com/image.jpg"}},
                "authors": [{"name": "Kishimoto, Masashi"}],
                "genres": [{"name": "Action"}],
            }
        ]
    }

    with patch("requests.get") as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = mock_response_data

        handler = JikanHandler()
        results = handler.search("Naruto")

        assert len(results) == 1
        assert results[0].title == "Naruto"


def test_the_request_has_a_timeout():
    # Without a timeout a request waits for the operating system to give
    # up, which can be minutes.
    with patch("requests.get") as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"data": []}

        handler = JikanHandler()
        handler.search("Naruto")

    assert mock_get.call_args.kwargs["timeout"] == REQUEST_TIMEOUT
