from fastapi import Request, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend import models
from backend.database import engine
from backend.routers import manga, jikan, excelIO
from starlette.responses import JSONResponse

API_KEY = "helloworld"
API_KEY_NAME = "manga-api-key"

app = FastAPI()

app.include_router(manga.router)
app.include_router(excelIO.router)
app.include_router(jikan.router)

# CORS settings
origins = [
    "*",
]


@app.middleware("http")
async def api_key_middleware(request: Request, call_next):
    api_key = request.headers.get(API_KEY_NAME)
    if api_key != API_KEY:
        return JSONResponse(status_code=400, content={"detail": "Invalid API Key"})
    response = await call_next(request)
    return response


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
