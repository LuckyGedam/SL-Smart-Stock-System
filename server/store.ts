import { Product } from '../src/types';
import { INITIAL_PRODUCTS } from '../src/data/mockProducts';

let products: Product[] = [...INITIAL_PRODUCTS];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySku(sku: string): Product | undefined {
  const normalized = sku.trim().toUpperCase();
  return products.find(p => p.sku.toUpperCase() === normalized);
}

export function upsertProduct(next: Product): Product {
  const normalized = next.sku.trim().toUpperCase();
  const idx = products.findIndex(p => p.sku.toUpperCase() === normalized);
  if (idx === -1) {
    const created: Product = { ...next, sku: normalized };
    products = [created, ...products];
    return created;
  }
  const updated: Product = { ...products[idx], ...next, sku: normalized };
  products = products.map((p, i) => (i === idx ? updated : p));
  return updated;
}

export function updateStock(sku: string, newStock: number): Product | undefined {
  const normalized = sku.trim().toUpperCase();
  const idx = products.findIndex(p => p.sku.toUpperCase() === normalized);
  if (idx === -1) return undefined;
  const updated: Product = { ...products[idx], currentStock: newStock };
  products = products.map((p, i) => (i === idx ? updated : p));
  return updated;
}

export function deleteProduct(sku: string): boolean {
  const normalized = sku.trim().toUpperCase();
  const before = products.length;
  products = products.filter(p => p.sku.toUpperCase() !== normalized);
  return products.length !== before;
}

export function bulkUpsert(imported: Product[]): { created: number; updated: number } {
  let created = 0;
  let updated = 0;

  for (const p of imported) {
    const normalized = p.sku.trim().toUpperCase();
    const existing = products.find(x => x.sku.toUpperCase() === normalized);
    if (existing) {
      upsertProduct({ ...p, sku: normalized });
      updated += 1;
    } else {
      upsertProduct({ ...p, sku: normalized });
      created += 1;
    }
  }

  return { created, updated };
}

