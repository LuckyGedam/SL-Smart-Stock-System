from datetime import datetime
from sqlalchemy import Column, DateTime, Float, Integer, String
from ..database import Base


class ProductORM(Base):
    __tablename__ = "products"

    id           = Column(Integer, primary_key=True, index=True)
    sku          = Column(String(100), unique=True, nullable=False, index=True)
    product_name = Column(String(255), nullable=False)
    category     = Column(String(120), nullable=False, default="General")
    subcategory  = Column(String(120), nullable=True)
    barcode      = Column(String(80),  nullable=True, default="")
    stock        = Column(Integer,     nullable=False, default=0)
    priority     = Column(String(40),  nullable=True)
    age_days     = Column(Integer,     nullable=True,  default=0)
    date_added   = Column(String(20),  nullable=True)   # YYYY-MM-DD
    status       = Column(String(40),  nullable=True,  default="active")
    price        = Column(Float,       nullable=False, default=0.0)
    location     = Column(String(120), nullable=True)
    image        = Column(String(500), nullable=True)   # URL — increased length
    created_at   = Column(DateTime, default=datetime.utcnow)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)