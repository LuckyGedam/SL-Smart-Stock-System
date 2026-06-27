import io
from datetime import datetime
from typing import Any

import openpyxl
from openpyxl import load_workbook

from ..schemas.product import ProductCreate


EXPECTED_COLUMNS = ["SKU", "Product Name", "Category", "Stock", "Added Date", "Barcode"]

# All column aliases we accept
COLUMN_MAP = {
    "sku"        : "SKU",
    "productname": "Product Name",
    "category"   : "Category",
    "stock"      : "Stock",
    "addeddate"  : "Added Date",
    "barcode"    : "Barcode",
    # extras from our converter output (ignored, not required)
    "color"      : None,
    "itemtype"   : None,
    "agedays"    : None,
    "pricemrp"   : None,
    "price(mrp)" : None,
}

def _normalize(s: str) -> str:
    return str(s).lower().replace(" ", "").replace("_", "").replace("-", "").replace("(", "").replace(")", "")

def read_excel_rows(file_bytes: bytes) -> list[dict[str, Any]]:
    workbook = load_workbook(filename=io.BytesIO(file_bytes), data_only=True)
    sheet = workbook.active
    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        return []

    # Find actual header row (first row with 'SKU' or 'sku' in any cell)
    header_row_idx = 0
    for i, row in enumerate(rows[:10]):
        normalized = [_normalize(str(c or "")) for c in row]
        if "sku" in normalized:
            header_row_idx = i
            break

    raw_headers = rows[header_row_idx]
    headers = [str(cell).strip() if cell is not None else "" for cell in raw_headers]
    normalized_headers = [_normalize(h) for h in headers]

    # Check required columns present (loose match, any order)
    required = ["sku", "productname", "category", "stock", "addeddate", "barcode"]
    missing = [r for r in required if r not in normalized_headers]
    if missing:
        raise ValueError(f"Missing required columns: {missing}. Got: {headers}")

    # Build index map
    col_idx = {_normalize(h): i for i, h in enumerate(headers) if h}

    products: list[dict[str, Any]] = []
    for row in rows[header_row_idx + 1:]:
        if not any(cell is not None and str(cell).strip() for cell in row):
            continue

        def get(key: str):
            idx = col_idx.get(key)
            return row[idx] if idx is not None and idx < len(row) else None

        sku  = str(get("sku") or "").strip()
        name = str(get("productname") or "").strip()

        if not sku or not name:
            continue

        # Handle Excel date objects in Added Date
        date_val = get("addeddate")
        if isinstance(date_val, datetime):
            date_str = date_val.strftime("%Y-%m-%d")
        else:
            date_str = str(date_val or "").strip()[:10]

        try:
            stock = int(float(str(get("stock") or 0)))
        except (ValueError, TypeError):
            stock = 0

        try:
            price = float(str(get("pricemrp") or get("price(mrp)") or 0))
        except (ValueError, TypeError):
            price = 0.0

        products.append({
            "sku"          : sku,
            "name"         : name,
            "category"     : str(get("category") or "General").strip(),
            "currentStock" : stock,
            "dateAdded"    : date_str,
            "barcode"      : str(get("barcode") or "").strip(),
            "price"        : price,
            "image"        : "",
            "location"     : "",
        })

    return products


def build_product_payloads(rows: list[dict[str, Any]]) -> list[ProductCreate]:
    return [ProductCreate(**row) for row in rows]
