from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import config
import models
from database import engine
from routers import manga, jikan, excelIO

app = FastAPI()

app.include_router(manga.router)
app.include_router(excelIO.router)
app.include_router(jikan.router)

# CORS settings
origins = [
    "http://192.168.56.1:3000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    models.Base.metadata.create_all(bind=engine)
    config.read()
