# MyMangaDB

This Application will be hopefully the must have Application for manga collectors.

This Application should help you keep an overview over your collection. Quit using ExcelSheets 
or other half baked Applications. This App will provide you with the possibility to enter a isbn 
or the title and volume and with that your volume will be saved in your collection along with Data 
like Authors, a Description, what Volumes there are, The Bookcover, All the Genres etc without having 
to enter the data manually.

#  About MyMangaDB

Currently the Application will run with FastAPI as framework. For saving an managing the 
data i am using sqlalchemy as recommended by FastAPI and a local database (sqlite3)

For getting Information like Authors and their roles, genres, description etc i am using the
MyAnimeList API. Because the api doesnt support isbn search the title will be fetched from the 
Google Books API if its available. In the future further data sources will be added for the bookcovers
of specific volumes etc.

# Planned Features

- Export your mangas to excel
