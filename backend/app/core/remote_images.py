"""Safe downloading of remote cover images.

The cover image URL is supplied by the client, so a backend that fetches it
turns the request into a server-side request forgery (SSRF) primitive: an
authenticated admin could point the backend at an internal service, a
loopback port or the cloud metadata endpoint and have the response written
to disk.

The helpers in this module restrict the target to public HTTP(S) addresses,
re-validate every redirect hop, bound the response size and make sure the
payload actually is an image.
"""

import ipaddress
import os
import socket
from typing import Optional
from urllib.parse import urljoin, urlparse

import requests
import urllib3

# Cover art should comfortably fit well below this bound.
MAX_IMAGE_BYTES = 20 * 1024 * 1024

# (connect, read) timeout in seconds.
REQUEST_TIMEOUT = (5, 15)

# How many redirects to follow before giving up.
MAX_REDIRECTS = 3

# Identifies the application to the remote server.
USER_AGENT = "MyMangaDB/1.0 (+https://github.com/FabianRolfMatthiasNoll/MyMangaDB)"

# Magic bytes of the image formats we accept.
_IMAGE_SIGNATURES = (
    b"\xff\xd8\xff",  # JPEG
    b"\x89PNG\r\n\x1a\n",  # PNG
    b"GIF87a",  # GIF
    b"GIF89a",  # GIF
)


class UnsafeRemoteURLError(ValueError):
    """Raised when a URL must not be fetched."""


def ssl_verification_enabled() -> bool:
    """Whether TLS certificates should be verified.

    ``DISABLE_SSL_VERIFY`` exists for setups that route traffic through a
    intercepting proxy. It is off by default and should stay that way in
    production.
    """
    if os.getenv("DISABLE_SSL_VERIFY", "false").lower() == "true":
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        return False
    return True


def _resolve_public_addresses(host: str) -> list:
    """Resolve ``host`` and return its addresses.

    Raises:
        UnsafeRemoteURLError: if the host does not resolve or resolves to an
            address that is not publicly routable.
    """
    try:
        infos = socket.getaddrinfo(host, None)
    except socket.gaierror as exc:
        raise UnsafeRemoteURLError(f"Could not resolve host '{host}'") from exc

    addresses = []
    for info in infos:
        address = info[4][0]
        try:
            parsed = ipaddress.ip_address(address)
        except ValueError as exc:
            raise UnsafeRemoteURLError(
                f"Could not parse the address '{address}' of '{host}'"
            ) from exc

        # ``is_global`` is False for loopback, private, link-local (which
        # includes the 169.254.169.254 metadata endpoint), multicast and
        # otherwise reserved ranges.
        if not parsed.is_global:
            raise UnsafeRemoteURLError(
                f"'{host}' resolves to the non-public address {address}"
            )
        addresses.append(address)

    if not addresses:
        raise UnsafeRemoteURLError(f"Could not resolve host '{host}'")

    return addresses


def validate_public_url(url: str) -> str:
    """Return ``url`` if it points at a public HTTP(S) resource.

    Raises:
        UnsafeRemoteURLError: if the scheme is unsupported, the host is
            missing or the host resolves to a non-public address.
    """
    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https"):
        raise UnsafeRemoteURLError(f"Unsupported URL scheme '{parsed.scheme}'")

    host = parsed.hostname
    if not host:
        raise UnsafeRemoteURLError("The URL has no host")

    # An IP literal needs no resolution, but it still has to be public.
    try:
        literal = ipaddress.ip_address(host)
    except ValueError:
        _resolve_public_addresses(host)
    else:
        if not literal.is_global:
            raise UnsafeRemoteURLError(f"'{host}' is not a publicly routable address")

    return url


def _looks_like_image(data: bytes) -> bool:
    """Return True iff ``data`` starts with a known image signature."""
    if any(data.startswith(signature) for signature in _IMAGE_SIGNATURES):
        return True
    # WebP: "RIFF" .... "WEBP"
    return len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP"


def _read_limited(response: requests.Response) -> bytes:
    """Read the body of ``response``, refusing more than the size cap."""
    chunks = []
    total = 0
    for chunk in response.iter_content(chunk_size=64 * 1024):
        total += len(chunk)
        if total > MAX_IMAGE_BYTES:
            raise UnsafeRemoteURLError(
                "The remote image exceeds the maximum allowed size"
            )
        chunks.append(chunk)
    return b"".join(chunks)


def download_public_image(
    url: str, session: Optional[requests.Session] = None
) -> bytes:
    """Download an image from a public URL.

    Redirects are followed manually so that every hop is validated - a
    redirect is a classic way around a check that only looks at the first
    URL.

    Args:
        url: The image URL. Must point at a public HTTP(S) address.
        session: Optional session to reuse.

    Returns:
        The image bytes.

    Raises:
        UnsafeRemoteURLError: if the URL is not safe to fetch, the response
            is not an image or it is too large.
    """
    current_url = validate_public_url(url)
    owns_session = session is None
    session = session or requests.Session()

    try:
        for _ in range(MAX_REDIRECTS + 1):
            response = session.get(
                current_url,
                timeout=REQUEST_TIMEOUT,
                allow_redirects=False,
                stream=True,
                verify=ssl_verification_enabled(),
                headers={"User-Agent": USER_AGENT},
            )

            try:
                if response.is_redirect or response.is_permanent_redirect:
                    location = response.headers.get("Location")
                    if not location:
                        raise UnsafeRemoteURLError(
                            "The remote server sent a redirect without a target"
                        )
                    current_url = validate_public_url(urljoin(current_url, location))
                    continue

                response.raise_for_status()

                content_type = response.headers.get("Content-Type", "")
                if content_type and not (
                    content_type.startswith("image/") or "octet-stream" in content_type
                ):
                    raise UnsafeRemoteURLError(
                        f"Unexpected content type '{content_type}'"
                    )

                data = _read_limited(response)
            finally:
                response.close()

            if not _looks_like_image(data):
                raise UnsafeRemoteURLError(
                    "The remote resource does not look like an image"
                )

            return data

        raise UnsafeRemoteURLError("Too many redirects")
    finally:
        if owns_session:
            session.close()
