import os
import sys
import uvicorn
import multiprocessing
import webview
import backend.main  # needed for pyinstaller

# pyinstaller main.py --onefile --noconsole --add-data="./frontend/build:build" --name MyMangaDB


# TODO: integrate build into exe and change database path (windows -> appdata) (Github actions spike?)
def start_frontend():
    # For a bundled executable, the _MEIPASS attribute will be set by PyInstaller
    # It contains the path to the temporary folder that PyInstaller uses to extract bundled resources.
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        base_path = sys._MEIPASS
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))

    html_path = os.path.join(base_path, "dist", "index.html")

    webview.create_window("MyMangaDB", html_path, maximized=True)
    webview.start()  # debug=True


def start_backend():
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000)


if __name__ == "__main__":
    multiprocessing.freeze_support()
    t1 = multiprocessing.Process(target=start_backend)
    t1.start()

    start_frontend()

    t1.terminate()
