from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router as api_router
from .config import settings
from .database import ensure_image_url_column, init_db


app = FastAPI(title="Smart Stock Priority System API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    # Critical idempotent schema fix for legacy Railway deployments.
    ensure_image_url_column()
    init_db()

app.include_router(api_router, prefix="/api")
