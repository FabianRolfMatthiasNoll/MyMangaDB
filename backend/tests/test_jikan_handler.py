from unittest.mock import patch

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
