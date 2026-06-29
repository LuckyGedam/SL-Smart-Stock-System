from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import settings

# Detect SQLite vs PostgreSQL
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    pass


def ensure_image_url_column() -> None:
    """Idempotent PostgreSQL migration for legacy deployments.

    Adds `products.image_url` if it does not exist.
    Must never recreate tables or drop data.
    """

    if not settings.DATABASE_URL.startswith("postgres"):
        # SQLite local dev uses Base.metadata.create_all; Postgres needs ALTER.
        return

    # Note: `image_url` should default to NULL (no DEFAULT clause).
    stmt = text("ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT")
    with engine.begin() as conn:
        conn.execute(stmt)


def init_db() -> None:
    from .models.product import ProductORM

    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
