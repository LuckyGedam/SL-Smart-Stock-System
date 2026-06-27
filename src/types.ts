export type UserRole = 'admin' | 'manager' | 'sales';

export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'NORMAL' | 'LOW' | 'OUT_OF_STOCK';

export type AgingCategory = 'NEW' | 'NORMAL' | 'OLD' | 'SELL_FIRST';

export interface Product {
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  dateAdded: string; // YYYY-MM-DD
  lastSoldDate?: string; // YYYY-MM-DD
  barcode: string;
  image: string;
  price: number;
  location?: string; // e.g. "Rack A3", "Display Shelf 2"
}

export interface ProductRecommendation {
  priorityLevel: PriorityLevel;
  agingCategory: AgingCategory;
  daysInInventory: number;
  stars: number; // 1 to 5
  recommendationTitle: string; // e.g., "SELL FIRST", "SHOW FIRST", "KEEP", "OUT OF STOCK"
  actionSubtitle: string;
  badgeColor: 'red' | 'orange' | 'yellow' | 'green' | 'gray';
  score: number; // calculated score for sorting
}

export interface ProductWithRec extends Product {
  rec: ProductRecommendation;
}

export type FilterTab = 'ALL' | 'SELL_FIRST' | 'OVERSTOCK' | 'OLD_STOCK' | 'NEW_STOCK' | 'OUT_OF_STOCK';
