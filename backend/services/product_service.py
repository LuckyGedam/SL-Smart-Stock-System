from datetime import datetime
from typing import Any
from sqlalchemy.orm import Session
from ..models.product import ProductORM
from ..schemas.product import ProductCreate, ProductUpdate


def _priority(stock: int, age: int) -> str:
    if stock == 0: return "OUT_OF_STOCK"
    if stock > 300 and age > 180: return "URGENT"
    if stock > 300: return "HIGH"
    if age > 180:   return "SELL_FIRST"
    if stock >= 100: return "MEDIUM"
    if stock >= 20:  return "NORMAL"
    return "LOW"


def _status(stock: int, age: int) -> str:
    if stock == 0:  return "out_of_stock"
    if age > 365:   return "very_old"
    if age > 180:   return "sell_first"
    if stock > 300: return "overstock"
    return "active"


def _build(data: ProductCreate | ProductUpdate | dict, existing: ProductORM | None = None) -> dict:
    payload = data.model_dump() if hasattr(data, "model_dump") else dict(data)
    # Remove None values so existing values are preserved on update
    payload = {k: v for k, v in payload.items() if v is not None}

    def get(key, fallback=None):
        return payload.get(key) or (getattr(existing, key, None) if existing else fallback)

    stock    = int(get("currentStock") or get("stock") or 0)
    age_days = int(get("age_days") or 0)
    date_added = str(get("dateAdded") or get("date_added") or "")

    # If age_days not provided, calculate from date_added
    if age_days == 0 and date_added:
        try:
            d = datetime.strptime(date_added[:10], "%Y-%m-%d")
            age_days = (datetime.utcnow() - d).days
        except ValueError:
            age_days = 0

    return {
        "sku"          : str(get("sku") or "").strip().upper(),
        "product_name" : get("name") or (existing.product_name if existing else ""),
        "category"     : get("category") or "General",
        "subcategory"  : get("subcategory"),
        "barcode"      : get("barcode") or "",
        "stock"        : stock,
        "priority"     : _priority(stock, age_days),
        "age_days"     : age_days,
        "date_added"   : date_added[:10] if date_added else None,
        "status"       : _status(stock, age_days),
        "price"        : float(get("price") or 0),
        "location"     : get("location"),
        "image_url"   : get("image_url") or get("image"),
        "image"       : get("image") or get("image_url"),
    }




def create_product(db: Session, payload: ProductCreate) -> ProductORM:
    p = ProductORM(**_build(payload))
    db.add(p); db.commit(); db.refresh(p)
    return p


def get_products(db: Session, skip: int = 0, limit: int = 5000):
    total = db.query(ProductORM).count()
    items = db.query(ProductORM).order_by(ProductORM.id).offset(skip).limit(limit).all()
    return items, total


def get_product_by_sku(db: Session, sku: str) -> ProductORM | None:
    return db.query(ProductORM).filter(ProductORM.sku == sku.strip().upper()).first()


def update_product(db: Session, sku: str, payload: ProductUpdate) -> ProductORM | None:
    p = get_product_by_sku(db, sku)
    if not p: return None
    for k, v in _build(payload, existing=p).items():
        setattr(p, k, v)
    p.updated_at = datetime.utcnow()
    db.commit(); db.refresh(p)
    return p


def delete_product(db: Session, sku: str) -> bool:
    p = get_product_by_sku(db, sku)
    if not p: return False
    db.delete(p); db.commit()
    return True