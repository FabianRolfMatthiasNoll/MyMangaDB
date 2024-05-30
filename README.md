# MyMangaDB

**MyMangaDB** aims to become the quintessential application for manga collectors. Say goodbye to using Excel sheets or makeshift solutions for managing your manga collection. With **MyMangaDB**, simply input the manga's title and the application will automatically populate your collection with details like the author(s), description, available volumes, cover art, genres, and more without any manual input from your end. **Currently only available for english mangas. If someone wants to enhance the manga grabbing process and add german mangas and more feel free to do it :)**

## 🔔 Disclaimer

As the development of this project is an endeavor undertaken during my student years, there might be occasional downtimes. But rest assured, I'm committed to building a reliable product and will continue refining it.

And i am happy to announce that Version 1.0.0 is finally released.

## 📖 About MyMangaDB

- **Framework:** FastAPI.
- **Database Management:** SQLAlchemy, as recommended by FastAPI, is used for data management. All data is stored in a local SQLite3 database.
- **Data Sources:**
  - The primary data, including author details, genres, and descriptions, are sourced from the Jikan API.
  - Plans are in place to integrate more data sources for book covers and other specifics.

Due to the varied nature of manga provider websites, the focus is on building an intuitive user interface. This will allow users to efficiently manage their collection.

## ✅ Current Features

- [x] Automated metadata retrieval (Author, Genres, Total Volumes, Description) // english mangas only currently
- [x] Efficient manga collection management
- [x] Support for multiple authors
- [x] Genre addition and management
- [x] Flexible manga cover management (manual and automatic)
- [x] Adding Volumes with covers to the manga
- [x] Excel list export and import
- [x] Protected Editing / Viewing Mode for hosting and sharing with friends
- [x] Out-of-the-Box working Docker setup

## 🤝 Acknowledgements

- **Manga Passion:** Special thanks to Manga Passion for providing the API to fetch metadata for German mangas.
  <img src="https://media.manga-passion.de/hosting/img/logo/logo.svg" alt="Manga Passion Logo" width="150"/>

## 🛠️ How to Use (WIP)

### Release Version

To launch the application, simply open the downloaded release file. This action will prompt a window to appear, signifying that the service is now active. Upon initiation, the app will create a local database on your device. Note that the service will cease operation the moment the window is closed.  
  
The database location varies by operating system:

- **Windows:** `User/Appdata/manga.db`
- **Linux:** `user/.config/manga.db`

### Source Code

Setting up the development environment for the first time involves creating a virtual environment. Execute the following command to do so:  
`python -m venv /path/to/new/virtual/environment`  
  
Afterward, navigate to the main directory and run the command below to install all required packages:  
`pip install -r requirements.txt`  
  
**Note for RaspberryPi users:** use the `requirements_rpi.txt`. Because `PyQt5` is making compatibility issues.  
  
In the `frontend` directory, you'll need to run:  `npm install`  
This is necessary to install all Node modules for the frontend.  
  
To initiate both the backend and frontend, refer to the settings provided in the `vscode launch.json`.  
**Please exercise caution** in using the application extensively, as future updates may introduce changes to the database schema.  

### Hosting

For hosting, a Docker compose file is provided. Update the following settings in the file:  

```yml
API_TOKEN: "YOUR_API_TOKEN_HERE" # Set the API Token twice for frontend-backend communication
API_URL: "http://localhost:8000" # Backend URL, typically the server IP
AUTH_PWD: "mymangadb" # Password for editing mode
DOCKER_MODE: "true" # Changes database location to the mounted volume for persistence
```

## 📸 Sneak Preview (v1.0.0)

*Note: Images below are work-in-progress and might undergo changes.*

### Dashboard

![Dashboard](https://raw.githubusercontent.com/FabianRolfMatthiasNoll/MyMangaDB/master/screenshots/dashboard.png)

### Manga Overview

![Manga Overview](https://raw.githubusercontent.com/FabianRolfMatthiasNoll/MyMangaDB/master/screenshots/manga_overview.png)

### Volume Overview

![Volume Overview](https://raw.githubusercontent.com/FabianRolfMatthiasNoll/MyMangaDB/master/screenshots/volume_overview.png)

### Editing Manga

![Editing Manga](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/blob/master/screenshots/manga_editing.png?raw=true)

### Manually Adding Mangas

![Adding Manga Manually](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/blob/master/screenshots/adding_manga_manual.png?raw=true)

### Searching for Mangas via MAL

![MAL Search](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/blob/master/screenshots/myanimelist_search.png?raw=true)
![MAL Search Preview](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/blob/master/screenshots/myanimelist_search_preview.png?raw=true)

### Current Settings Menu

![Exporting/Importing Library](https://github.com/FabianRolfMatthiasNoll/MyMangaDB/blob/master/screenshots/settings_menu.png?raw=true)
