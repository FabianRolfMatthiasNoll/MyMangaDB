import os
import sys
import threading

import uvicorn
import webview
from fastapi.staticfiles import StaticFiles

# Add the current directory to sys.path to allow importing backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.app.main import app  # noqa: E402


def start_server():
    # Run uvicorn programmatically
    # log_level="error" to keep the console clean
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="error")


if __name__ == "__main__":
    # Determine path to static files (frontend build)
    if getattr(sys, "frozen", False):
        # Running as compiled executable
        base_dir = sys._MEIPASS
        static_dir = os.path.join(base_dir, "dist")
    else:
        # Running from source
        base_dir = os.path.dirname(os.path.abspath(__file__))
        static_dir = os.path.join(base_dir, "frontend", "dist")

    # Check if static directory exists
    if os.path.exists(static_dir):
        # Remove the default root route if it exists to allow serving index.html
        # This prevents the "Welcome to Manga API" JSON response at root
        new_routes = [r for r in app.router.routes if getattr(r, "path", "") != "/"]
        app.router.routes = new_routes

        # Mount static files at root
        app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
    else:
        print(
            f"Warning: Static directory {static_dir} not found. "
            "Frontend will not be served."
        )

    # Start server in a separate thread
    t = threading.Thread(target=start_server)
    t.daemon = True
    t.start()

    # Start the webview window
    webview.create_window("MyMangaDB", "http://127.0.0.1:8000", width=1200, height=800)
    webview.start()
