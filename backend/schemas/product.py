from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):
    sku:          Optional[str]   = None
    name:         Optional[str]   = None
    category:     Optional[str]   = None
    subcategory:  Optional[str]   = None
    barcode:      Optional[str]   = None
    currentStock: Optional[int]   = None
    price:        Optional[float] = None
    location:     Optional[str]   = None
    dateAdded:    Optional[str]   = None
    image:        Optional[str]   = None
    priority:     Optional[str]   = None
    age_days:     Optional[int]   = None
    status:       Optional[str]   = None


class ProductCreate(ProductBase):
    sku:          str
    name:         str
    category:     str   = "General"
    currentStock: int   = 0
    price:        float = 0.0
    barcode:      str   = ""


class ProductUpdate(ProductBase):
    pass


class ProductOut(BaseModel):
    id:           int
    sku:          str
    name:         str
    category:     str
    subcategory:  Optional[str]   = None
    barcode:      Optional[str]   = None
    currentStock: int
    price:        float
    location:     Optional[str]   = None
    dateAdded:    Optional[str]   = None
    image:        Optional[str]   = None
    priority:     Optional[str]   = None
    age_days:     Optional[int]   = None
    status:       Optional[str]   = None
    created_at:   datetime
    updated_at:   datetime
    model_config  = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    products: list[ProductOut]
    total:    int
    page:     int
    size:     int