# MyMangaDB

This Application will be hopefully the must have Application for manga collectors.

This Application should help you keep an overview over your collection. Quit using ExcelSheets 
or other half baked Applications. This App will provide you with the possibility to enter a isbn 
or the title and volume and with that your volume will be saved in your collection along with Data 
like Authors, a Description, what Volumes there are, The Bookcover, All the Genres etc without having 
to enter the data manually.

# Disclaimer

The Project will have downtimes but please dont worry i really want to create a working product but i am student and
cant always work on it.

#  About MyMangaDB

Currently the Application will run with FastAPI as framework. For saving an managing the 
data i am using sqlalchemy as recommended by FastAPI and a local database (sqlite3)

For getting Information like Authors and their roles, genres, description etc i am using the
MyAnimeList API. Because the api doesnt support isbn search the title will be fetched from the 
Google Books API if its available. In the future further data sources will be added for the bookcovers
of specific volumes etc.

The Manga Provider Sites are sadly all extremly different thats why the main aspect will be a good UI
where on can mostly manually manage their mangas. Things like Book Covers should be something thats always 
fetchable. Also sadly really good manga provider arent ready to cooperate for this project maybe in the 
future that will change. And maybe in the future we can create a database that catalogs standarized alle the Mangas

# Planned Features

- Export your mangas to excel
- Get MetaData like Author, Genres, Total Volumes, Description completely automized if wanted
- sort, manage and share your manga collection
- Import and Export Manga Data through a excel or json file
- and many more

# How to use (WIP)

to start up the backend and frontend please refer to the vscode launch.json 
To make changes to the database you can use http://127.0.0.1:8000/docs to interact
with the backend. The frontend is currently automatically fetching all mangas from the database and displaying them in a list.
This is just a proof of concept. A search, sort and add,remove function will be added shortly. Please dont use the software for real
currently because changes to the database will definitly be made.
