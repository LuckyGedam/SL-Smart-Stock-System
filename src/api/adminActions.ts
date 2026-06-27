import { Product } from '../types';
import { addOrUpdateProductApi, deleteProductApi, updateStock, uploadProductsApi } from './sspsApi';

export async function adminUpdateStock(sku: string, currentStock: number): Promise<Product> {
  return updateStock(sku, currentStock);
}

export async function adminDeleteProduct(sku: string): Promise<void> {
  return deleteProductApi(sku);
}

export async function adminAddProduct(product: Product): Promise<Product> {
  return addOrUpdateProductApi(product);
}

export async function adminBulkUpload(file: File): Promise<{ inserted: number; updated: number; skipped: number; errors: number }> {
  return uploadProductsApi(file);
}

