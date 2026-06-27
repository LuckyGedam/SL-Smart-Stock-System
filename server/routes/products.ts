import express from 'express';
import { z } from 'zod';
import { Product } from '../../src/types';
import { bulkUpsert, deleteProduct, getAllProducts, getProductBySku, updateStock, upsertProduct } from '../store';

const router = express.Router();

const UpsertProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  currentStock: z.number().int().nonnegative(),
  dateAdded: z.string().min(1),
  barcode: z.string().min(1),
  image: z.string().min(1),
  price: z.number().nonnegative(),
  location: z.string().optional(),
  lastSoldDate: z.string().optional()
});

router.get('/products', (_req, res) => {
  res.json({ products: getAllProducts() });
});

router.get('/products/:sku', (req, res) => {
  const sku = req.params.sku;
  const found = getProductBySku(sku);
  if (!found) return res.status(404).json({ message: 'Product not found' });
  res.json({ product: found });
});

router.put('/products/:sku/stock', (req, res) => {
  const sku = req.params.sku;
  const schema = z.object({ currentStock: z.number().int().nonnegative() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', details: parsed.error.flatten() });
  }

  const updated = updateStock(sku, parsed.data.currentStock);
  if (!updated) return res.status(404).json({ message: 'Product not found' });
  res.json({ product: updated });
});

router.post('/products', (req, res) => {
  const parsed = UpsertProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', details: parsed.error.flatten() });
  }
  const created = upsertProduct(parsed.data as Product);
  res.status(201).json({ product: created, upserted: true });
});

router.delete('/products/:sku', (req, res) => {
  const sku = req.params.sku;
  const ok = deleteProduct(sku);
  if (!ok) return res.status(404).json({ message: 'Product not found' });
  res.status(204).send();
});

// Bulk upload endpoint (expects JSON array of Product)
router.post('/products/bulk-upload', (req, res) => {
  const schema = z.object({ products: z.array(UpsertProductSchema) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', details: parsed.error.flatten() });
  }

  const result = bulkUpsert(parsed.data.products as unknown as Product[]);
  res.json({ ...result });
});

export default router;

