from datetime import datetime, timedelta, timezone
from typing import Any
import traceback


import jwt
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..schemas.product import ProductCreate, ProductOut, ProductUpdate

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
    # ProductOut expects datetime objects for created_at/updated_at.
    # Prefer image_url; fall back to legacy image.
    image_url = getattr(p, "image_url", None) or getattr(p, "image", None) or ""

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
        "image_url":   image_url,
        "image":        p.image,


        "priority":     p.priority,
        "age_days":     p.age_days,

        "status":       p.status,
        "created_at":   p.created_at,
        "updated_at":   p.updated_at,
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
) -> ProductOut:
    existing = get_product_by_sku(db, product.sku)
    if existing:
        p = update_product(db, product.sku, ProductUpdate(**product.model_dump()))
        return serialize_product(p)  # type: ignore[arg-type]
    p = create_product(db, product)
    return serialize_product(p)  # type: ignore[arg-type]



@router.put("/products/{sku}", response_model=ProductOut)
def update_product_route(
    sku:     str,
    product: ProductUpdate,
    db:      Session = Depends(get_db),
    _user:   dict[str, Any] = Depends(get_current_user),
) -> ProductOut:
    existing = get_product_by_sku(db, sku)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Product '{sku}' not found")
    p = update_product(db, sku, product)
    # p is guaranteed non-null because we checked existing.
    return serialize_product(p)  # type: ignore[arg-type]



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

    print("[DEBUG] Upload started")
    print(f"[DEBUG] Excel file received filename={file.filename}")

    contents = file.file.read()

    try:
        rows = read_excel_rows(contents)
    except Exception:
        traceback.print_exc()
        raise

    print(f"[DEBUG] Number of rows={len(rows)}")
    if rows:
        print(f"[DEBUG] First parsed excel row={rows[0]}")

    if not rows:
        raise HTTPException(status_code=422, detail="No valid rows found in file. Check column headers.")

    payloads = build_product_payloads(rows)
    if payloads:
        print(f"[DEBUG] First ProductCreate payload model_dump={payloads[0].model_dump()}")

    inserted = 0
    updated = 0
    skipped = 0
    error_details: list[str] = []

    # Prefetch existing products by SKU to avoid N queries.
    skus = [p.sku.strip().upper() for p in payloads if p.sku]
    existing_map: dict[str, Any] = {}

    if skus:
        from sqlalchemy import select
        from ..models.product import ProductORM

        stmt = select(ProductORM).where(ProductORM.sku.in_(set(skus)))
        for row in db.execute(stmt).scalars().all():
            existing_map[row.sku.strip().upper()] = row

    print(f"[DEBUG] Existing SKU lookup size={len(existing_map)}")

    from ..services.product_service import _build  # reuse mapping logic


    # FastAPI dependency provides an active Session/transaction context.
    # Do NOT open another transaction block.
    try:
        for payload in payloads:
            sku = payload.sku.strip().upper() if payload.sku else ""
            try:
                print(f"[DEBUG] Processing SKU={sku}")
                existing = existing_map.get(sku)

                if existing:
                    print("[DEBUG] Existing SKU lookup found")
                    payload_dump = payload.model_dump()
                    print(f"[DEBUG] ProductCreate.model_dump() for SKU={sku}: {payload_dump}")

                    updates = _build(ProductUpdate(**payload_dump), existing=existing)
                    print(f"[DEBUG] _build() output for SKU={sku}: {updates}")

                    for k, v in updates.items():
                        setattr(existing, k, v)
                    existing.updated_at = datetime.utcnow()
                    updated += 1
                else:
                    new_data = _build(payload, existing=None)
                    print(f"[DEBUG] _build() output for new SKU={sku}: {new_data}")

                    from ..models.product import ProductORM
                    print(f"[DEBUG] ProductORM(**new_data) dict for SKU={sku}: {new_data}")

                    print(f"[DEBUG] Before db.add() for SKU={sku}")
                    db.add(ProductORM(**new_data))
                    inserted += 1
            except Exception as e:
                print(f"[DEBUG] Exception while processing SKU={sku} exception_type={type(e)} exception_message={e}")
                traceback.print_exc()
                raise

        print("[DEBUG] Before db.commit()")
        db.commit()
        print("[DEBUG] After db.commit()")

        return {


            "message":          "Upload completed",
            "inserted":         inserted,
            "updated":          updated,
            "skipped":          skipped,
            "errors":           len(error_details),
            "error_details":    error_details[:10],
            "expected_columns": EXPECTED_COLUMNS,
        }
    except Exception:
        print("[DEBUG] Upload failed in outer handler")
        traceback.print_exc()
        db.rollback()
        raise



