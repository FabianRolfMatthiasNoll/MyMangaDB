# MyMangaDB

**MyMangaDB** aims to become the quintessential application for manga collectors. Say goodbye to using Excel sheets or makeshift solutions for managing your manga collection. With **MyMangaDB**, simply input the manga's ~~ISBN or its~~ title and volume, and the application will automatically populate your collection with details like the author(s), description, available volumes, cover art, genres, and more without any manual input from your end.

## 🔔 Disclaimer

As the development of this project is an endeavor undertaken during my student years, there might be occasional downtimes. But rest assured, I'm committed to building a reliable product and will continue refining it.

## 📖 About MyMangaDB

- **Framework:** FastAPI.
- **Database Management:** SQLAlchemy, as recommended by FastAPI, is used for data management. All data is stored in a local SQLite3 database.
- **Data Sources:**
  - The primary data, including author details, genres, and descriptions, are sourced from the MyAnimeList API.
  - Plans are in place to integrate more data sources for book covers and other specifics.

Due to the varied nature of manga provider websites, the focus is on building an intuitive user interface. This will allow users to efficiently manage their collection.

## ✅ Current Features

- [x] Automated metadata retrieval (Author, Genres, Total Volumes, Description) // english mangas only currently
- [x] Efficient manga collection management
- [x] Support for multiple authors and their roles
- [x] Genre addition and management
- [x] Flexible manga cover management (manual and automatic)
- [x] Excel list export and import

## 📅 Planned Features for v1.0.0

- [x] Excel list export and import -> most important feature!
- [x] Enhanced collection management tools (sorting, sharing)
- [x] Search bar with sorting and filtering options
- [x] Genre and author/role-based filtering
- [ ] switch from MAL to Jikan
- [ ] add reader and collection status
- [ ] (Desktop installer)

## 🚀 Future Features

- [ ] Automated manga cover search
- [ ] Custom field addition (e.g., price)
- [ ] Adding ISBN to the Mangas
- [ ] Multi-source metadata gathering
- [ ] Automated server setup for personal hosting
- [ ] Web service availability
- [ ] Dynamic design overhaul
- [ ] Visual analytics for your collection
- [ ] Add and Fetch Mangas from the Web by ISBN
- [ ] multi language meta data fetching

## 🛠️ How to Use (WIP)

To initialize both backend and frontend, please check the `vscode launch.json`. To make modifications to the database, navigate to `http://127.0.0.1:8000/docs` to engage with the backend. For now, the frontend fetches and lists all mangas from the database, functioning as a proof of concept. **Caution**: Avoid using the software intensively as database changes are impending.

**Generate API:**

```bash
cd frontend/src/api
npx openapi-generator-cli generate -i http://127.0.0.1:8000/openapi.json -g typescript-fetch
```

## 📸 Sneak Preview

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
