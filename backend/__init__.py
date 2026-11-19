"""MyMangaDB backend package.

The backend ``.env`` file is loaded here - before any submodule is
imported - because configuration values such as ``API_TOKEN`` are read
while the modules are imported. Loading the file later (for example in
``main.py``) would be too late and the application would silently fall
back to its defaults.
"""

from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent
ENV_PATH = BACKEND_DIR / ".env"

if ENV_PATH.is_file():
    load_dotenv(dotenv_path=ENV_PATH, override=False)
