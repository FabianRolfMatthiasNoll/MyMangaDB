from fastapi import FastAPI

import config
import models
from database import engine
from routers import manga, mal

app = FastAPI()

app.include_router(manga.router)
app.include_router(mal.router)


@app.on_event("startup")
async def startup():
    models.Base.metadata.create_all(bind=engine)
    config.read()
