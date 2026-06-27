import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'backend' / 'data' / 'ssps.db'}")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ssps-dev-secret-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    UPLOAD_DIR: Path = Path(os.getenv("UPLOAD_DIR", str(BASE_DIR / "backend" / "uploads")))

    # Allow all origins in dev — restrict in production via .env
    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "*").split(",")


settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Ensure DB directory exists
if settings.DATABASE_URL.startswith("sqlite:///"):
    db_path_str = settings.DATABASE_URL.replace("sqlite:///", "", 1)
    db_path = Path(db_path_str)
    if not db_path.is_absolute():
        db_path = (BASE_DIR / db_path).resolve()
    db_path.parent.mkdir(parents=True, exist_ok=True)