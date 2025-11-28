# MyMangaDB

**MyMangaDB** aims to become the quintessential application for manga collectors. Say goodbye to using Excel sheets or makeshift solutions for managing your manga collection. With **MyMangaDB**, simply input the manga's title and the application will automatically populate your collection with details like the author(s), description, available volumes, cover art, genres, and more without any manual input from your end. **Currently only available for german mangas. English via Jikan Api will be soon reimplemented. If someone wants to enhance the manga grabbing process and add german mangas and more feel free to do it :)**

## 🔔 Disclaimer

As the development of this project is an endeavor undertaken during my student years, there might be occasional downtimes. But rest assured, I'm committed to building a reliable product and will continue refining it.

And i am happy to announce that Version 1.0.0 is finally released.

## 📖 About MyMangaDB

- **Framework:** FastAPI.
- **Database Management:** SQLAlchemy, as recommended by FastAPI, is used for data management. All data is stored in a local SQLite3 database.
- **Data Sources:**
  - The primary data, including author details, genres, and descriptions, are sourced from the Jikan API and MangaPassion.
  - Plans are in place to integrate more data sources for book covers and other specifics.

Due to the varied nature of manga provider websites, the focus is on building an intuitive user interface. This will allow users to efficiently manage their collection.

## 🤝 Acknowledgements

- **Manga Passion:** Special thanks to Manga Passion for providing the API to fetch metadata for German mangas.
  <img src="https://media.manga-passion.de/hosting/img/logo/logo.svg" alt="Manga Passion Logo" width="150"/>

## 🛠️ How to Use (WIP)

### Release Version

To launch the application, simply open the downloaded release file. This action will prompt a window to appear, signifying that the service is now active. Upon initiation, the app will create a local database on your device. Note that the service will cease operation the moment the window is closed.

The database location varies by operating system:

- **Windows:** `User/Appdata/manga.db`
- **Linux:** `user/.config/manga.db`

### Development Setup

We use [Task](https://taskfile.dev/) to manage our development commands.

**Prerequisites:**
- Python 3.12+
- Node.js 20+
- [Task](https://taskfile.dev/installation/)

**Quick Start:**

1.  **Setup the environment:**
    This command will create the virtual environment, install dependencies (backend & frontend), generate `.env` files, and install git hooks.
    ```bash
    task setup
    ```

2.  **Run the application:**
    Starts both backend and frontend in development mode.
    ```bash
    task dev
    ```

**Quality Assurance:**

- **Run Tests:** `task backend:test`
- **Linting:** `task lint` (Runs pre-commit hooks manually)
- **Generate API Client:** `task frontend:generate-api` (Updates the frontend API client based on backend changes)

**Note for RaspberryPi users:** use the `requirements_rpi.txt`. Because `PyQt5` is making compatibility issues.

**Please exercise caution** in using the application extensively, as future updates may introduce changes to the database schema.

### Hosting

For hosting, a Docker compose file is provided. Update the following settings in the file:

```yml
API_URL: "http://localhost:8000" # Backend URL, typically the server IP
DOCKER_MODE: "true" # Changes database location to the mounted volume for persistence
```

### Authentication

The application now uses Role-Based Access Control (RBAC).
Default users created on startup:

- **Admin:** `admin` / `admin` (Full access)
- **Guest:** `guest` / `guest` (Read-only access)

**Important:** Change these passwords immediately after first login!

## 📸 Sneak Preview (v2.0.0)

*Note: Images below are work-in-progress and might undergo changes.*

### Dashboard

![Dashboard](https://raw.githubusercontent.com/FabianRolfMatthiasNoll/MyMangaDB/frontendRework/screenshots/dashboard.png)

### Manga Overview

![Manga Overview](https://raw.githubusercontent.com/FabianRolfMatthiasNoll/MyMangaDB/frontendRework/screenshots/manga_overview.png)

### Editing Manga

![Editing Manga](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/blob/frontendRework/screenshots/manga_editing.png?raw=true)

### Automatic Manga Fetching

![Automatic Manga Fetching](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/blob/frontendRework/screenshots/automatic_manga_fetching.png?raw=true)
