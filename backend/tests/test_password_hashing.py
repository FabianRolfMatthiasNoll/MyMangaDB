"""Tests for the password hashing.

The hashes of the existing installations were created by passlib, which
truncated passwords longer than 72 bytes silently. The hashing now uses
bcrypt directly, so the same truncation has to happen - otherwise those
passwords would stop working.
"""

import bcrypt

from backend.app.core.security import (
    MAX_PASSWORD_BYTES,
    get_password_hash,
    verify_password,
)


def test_a_password_round_trips():
    """The hash of a password verifies against that password."""
    hashed = get_password_hash("correct horse battery staple")
    assert verify_password("correct horse battery staple", hashed)
    assert not verify_password("wrong password", hashed)


def test_the_hash_is_a_standard_bcrypt_hash():
    """The hash is a plain bcrypt hash, so it stays readable by other
    tools and by the hashes of the existing installations."""
    hashed = get_password_hash("secret")
    assert hashed.startswith("$2b$")
    assert hashed.startswith("$2b$12$")
    assert len(hashed) == 60


def test_two_hashes_of_the_same_password_differ():
    """Every hash gets its own salt."""
    assert get_password_hash("secret") != get_password_hash("secret")


def test_a_long_password_is_truncated():
    """bcrypt only hashes the first 72 bytes. The hash of a long password
    has to verify against that long password."""
    password = "a" * 100
    hashed = get_password_hash(password)
    assert verify_password(password, hashed)


def test_a_long_password_matches_its_truncated_form():
    """This is what keeps the hashes of the existing installations valid:
    passlib truncated silently, so a password of 100 characters was
    stored as its first 72 bytes."""
    password = "a" * 100
    hashed = get_password_hash(password)
    assert verify_password(password[:MAX_PASSWORD_BYTES], hashed)


def test_a_password_that_only_differs_after_the_cut_is_accepted():
    """The truncation is what passlib did, so the behaviour is unchanged -
    the last characters beyond the limit do not matter."""
    hashed = get_password_hash("a" * 80)
    assert verify_password("a" * 72 + "different", hashed)


def test_a_corrupt_hash_is_a_wrong_password():
    """A hash that bcrypt cannot read must not raise - a login with it is
    a wrong password, not a server error."""
    assert not verify_password("secret", "not-a-hash")
    assert not verify_password("secret", "$2b$12$tooshort")


def test_a_hash_of_another_bcrypt_implementation_verifies():
    """The hashes of the existing installations were created by passlib.
    They are ordinary bcrypt hashes and have to keep working."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(b"secret", salt).decode("utf-8")
    assert verify_password("secret", hashed)
