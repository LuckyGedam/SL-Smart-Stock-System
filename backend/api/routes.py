from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..schemas.product import ProductCreate, ProductListResponse, ProductOut, ProductUpdate
from ..services.product_service import (
    create_product,
    delete_product,
    get_product_by_sku,
    get_products,
    update_product,
)
from ..utils.uploads import EXPECTED_COLUMNS, build_product_payloads, read_excel_rows

router = APIRouter()
security = HTTPBearer(auto_error=False)


# ── Auth helpers ───────────────────────────────────────────────────────────────

def create_token(username: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": username, "role": role, "exp": expire},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict[str, Any]:
    if not creds:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        payload = jwt.decode(creds.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc
    return payload


# ── Auth routes ────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


USERS = {
    "admin":   ("admin123",   "admin"),
    "manager": ("manager123", "manager"),
    "sales":   ("sales123",   "sales"),
}


@router.post("/login")
def login(payload: LoginRequest) -> dict[str, str]:
    user = USERS.get(payload.username)
    if not user or user[0] != payload.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "access_token": create_token(payload.username, user[1]),
        "token_type": "bearer",
    }


@router.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "timestamp": datetime.now(timezone.utc).isoformat()}


# ── Product routes ─────────────────────────────────────────────────────────────

def serialize_product(p: Any) -> dict[str, Any]:
    return {
        "id":           p.id,
        "sku":          p.sku,
        "name":         p.product_name,
        "category":     p.category,
        "subcategory":  p.subcategory,
        "barcode":      p.barcode,
        "currentStock": p.stock,
        "price":        p.price,
        "location":     p.location,
        "dateAdded":    p.date_added,
        "image":        p.image,
        "priority":     p.priority,
        "age_days":     p.age_days,
        "status":       p.status,
        "created_at":   p.created_at.isoformat() if p.created_at else None,
        "updated_at":   p.updated_at.isoformat() if p.updated_at else None,
    }


@router.get("/products")
def list_products(
    skip:  int = Query(0,    ge=0),
    limit: int = Query(5000, ge=1, le=10000),
    db:    Session = Depends(get_db),
    _user: dict[str, Any] = Depends(get_current_user),
) -> dict:
    items, total = get_products(db, skip=skip, limit=limit)
    return {
        "products": [serialize_product(p) for p in items],
        "total":    total,
        "page":     skip // limit + 1,
        "size":     limit,
    }


@router.post("/products", response_model=ProductOut, status_code=201)
def create_product_route(
    product: ProductCreate,
    db:      Session = Depends(get_db),
    _user:   dict[str, Any] = Depends(get_current_user),
) -> Any:
    existing = get_product_by_sku(db, product.sku)
    if existing:
        return update_product(db, product.sku, ProductUpdate(**product.model_dump()))
    return create_product(db, product)


@router.put("/products/{sku}", response_model=ProductOut)
def update_product_route(
    sku:     str,
    product: ProductUpdate,
    db:      Session = Depends(get_db),
    _user:   dict[str, Any] = Depends(get_current_user),
) -> Any:
    existing = get_product_by_sku(db, sku)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Product '{sku}' not found")
    return update_product(db, sku, product)


@router.delete("/products/{sku}", status_code=204)
def delete_product_route(
    sku:   str,
    db:    Session = Depends(get_db),
    _user: dict[str, Any] = Depends(get_current_user),
) -> None:
    existing = get_product_by_sku(db, sku)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Product '{sku}' not found")
    delete_product(db, sku)


# ── Upload route ───────────────────────────────────────────────────────────────

@router.post("/upload", status_code=200)
def upload_products(
    file:  UploadFile = File(...),
    db:    Session = Depends(get_db),
    _user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(status_code=400, detail="Only .xlsx, .xls, or .csv files are supported")

    contents = file.file.read()

    try:
        rows = read_excel_rows(contents)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to read file: {e}")

    if not rows:
        raise HTTPException(status_code=422, detail="No valid rows found in file. Check column headers.")

    payloads = build_product_payloads(rows)
    inserted = updated = skipped = 0
    error_details: list[str] = []

    for payload in payloads:
        try:
            existing = get_product_by_sku(db, payload.sku)
            if existing:
                update_product(db, payload.sku, ProductUpdate(**payload.model_dump()))
                updated += 1
            else:
                create_product(db, payload)
                inserted += 1
        except Exception as e:
            skipped += 1
            error_details.append(f"SKU {payload.sku}: {e}")

    return {
        "message":          "Upload completed",
        "inserted":         inserted,
        "updated":          updated,
        "skipped":          skipped,
        "errors":           len(error_details),
        "error_details":    error_details[:10],
        "expected_columns": EXPECTED_COLUMNS,
    }