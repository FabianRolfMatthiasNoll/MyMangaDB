import pytest
import requests

from backend.app.core.remote_images import (
    UnsafeRemoteURLError,
    _looks_like_image,
    download_public_image,
    validate_public_url,
)

# A 1x1 pixel JPEG.
JPEG_BYTES = bytes.fromhex(
    "ffd8ffe000104a46494600010100000100010000ffdb004300"
    "08060607060508070707090908080a0c140d0c0b0b0c191213"
    "0f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30"
    "313434341f27393d38323c2e333432ffc0000b080001000101011100"
    "ffc40014000100000000000000000000000000000009ffc40014"
    "01010100000000000000000000000000000000ffda0008010100003f"
    "00d2cf20ffd9"
)


@pytest.mark.parametrize(
    "url",
    [
        "http://127.0.0.1/admin",
        "http://localhost:8000/",
        "http://169.254.169.254/latest/meta-data/",
        "http://10.0.0.1/internal",
        "http://192.168.1.1/router",
        "http://172.16.0.1/internal",
        "http://[::1]/internal",
        "http://0.0.0.0/",
    ],
)
def test_rejects_non_public_addresses(url):
    with pytest.raises(UnsafeRemoteURLError):
        validate_public_url(url)


@pytest.mark.parametrize(
    "url",
    [
        "file:///etc/passwd",
        "ftp://example.com/image.jpg",
        "gopher://example.com/",
        "/etc/passwd",
        "",
    ],
)
def test_rejects_unsupported_schemes(url):
    with pytest.raises(UnsafeRemoteURLError):
        validate_public_url(url)


def test_rejects_missing_host():
    with pytest.raises(UnsafeRemoteURLError):
        validate_public_url("http:///no-host")


def test_accepts_public_addresses():
    # 93.184.216.34 is a public address (example.com), 8.8.8.8 is Google DNS.
    assert validate_public_url("http://8.8.8.8/image.jpg")
    assert validate_public_url("https://93.184.216.34/image.jpg")


def test_detects_image_signatures():
    assert _looks_like_image(JPEG_BYTES)
    assert _looks_like_image(b"\x89PNG\r\n\x1a\n" + b"\x00" * 16)
    assert _looks_like_image(b"GIF89a" + b"\x00" * 16)
    assert _looks_like_image(b"RIFF\x00\x00\x00\x00WEBPVP8 ")
    assert not _looks_like_image(b"<html><body>not an image</body></html>")
    assert not _looks_like_image(b"")


class _FakeResponse:
    def __init__(self, status_code=200, headers=None, content=b""):
        self.status_code = status_code
        self.headers = headers or {}
        self._content = content
        self.is_redirect = status_code in (301, 302, 303, 307, 308)
        self.is_permanent_redirect = status_code in (301, 308)

    def raise_for_status(self):
        if self.status_code >= 400:
            raise requests.HTTPError(f"status {self.status_code}")

    def iter_content(self, chunk_size=65536):
        yield self._content

    def close(self):
        pass


class _FakeSession:
    """Records the URLs that were requested and replays canned responses."""

    def __init__(self, responses):
        self.responses = list(responses)
        self.requested = []

    def get(self, url, **kwargs):
        self.requested.append(url)
        return self.responses.pop(0)

    def close(self):
        pass


def test_follows_a_redirect_and_validates_every_hop(monkeypatch):
    session = _FakeSession(
        [
            _FakeResponse(
                status_code=302, headers={"Location": "http://8.8.8.8/x.jpg"}
            ),
            _FakeResponse(headers={"Content-Type": "image/jpeg"}, content=JPEG_BYTES),
        ]
    )
    monkeypatch.setattr(
        "backend.app.core.remote_images.validate_public_url",
        lambda url: url,
    )

    data = download_public_image("https://example.com/cover.jpg", session=session)

    assert data == JPEG_BYTES
    assert session.requested == [
        "https://example.com/cover.jpg",
        "http://8.8.8.8/x.jpg",
    ]


def test_rejects_a_redirect_to_an_internal_address(monkeypatch):
    session = _FakeSession(
        [
            _FakeResponse(
                status_code=302, headers={"Location": "http://169.254.169.254/"}
            )
        ]
    )

    with pytest.raises(UnsafeRemoteURLError):
        download_public_image("https://example.com/cover.jpg", session=session)


def test_rejects_a_response_that_is_not_an_image(monkeypatch):
    session = _FakeSession(
        [
            _FakeResponse(
                headers={"Content-Type": "text/html"},
                content=b"<html>internal service</html>",
            )
        ]
    )
    monkeypatch.setattr(
        "backend.app.core.remote_images.validate_public_url",
        lambda url: url,
    )

    with pytest.raises(UnsafeRemoteURLError):
        download_public_image("https://example.com/cover.jpg", session=session)


def test_rejects_an_oversized_response(monkeypatch):
    monkeypatch.setattr(
        "backend.app.core.remote_images.validate_public_url",
        lambda url: url,
    )
    monkeypatch.setattr("backend.app.core.remote_images.MAX_IMAGE_BYTES", 1024)

    session = _FakeSession(
        [
            _FakeResponse(
                headers={"Content-Type": "image/jpeg"},
                content=b"\xff\xd8\xff" + b"\x00" * 4096,
            )
        ]
    )

    with pytest.raises(UnsafeRemoteURLError):
        download_public_image("https://example.com/cover.jpg", session=session)
