import axios, { AxiosHeaders, AxiosError, type AxiosRequestConfig } from 'axios';
import { Product } from '../types';

const BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: false,   // must be false when backend uses allow_origins=["*"]
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ssps_token');
  if (token) {
    const headers = new AxiosHeaders(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

// Auto-retry once on 401
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      localStorage.removeItem('ssps_token');
      await ensureAuth();
      return api(original);
    }
    return Promise.reject(error);
  }
);

// ── Auth: auto-login, no login page needed ────────────────────────────────────

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now() + 5 * 60 * 1000;
  } catch {
    return true;
  }
}

async function ensureAuth(): Promise<string> {
  const existing = localStorage.getItem('ssps_token');
  if (existing && !isTokenExpired(existing)) return existing;

  localStorage.removeItem('ssps_token');
  const res = await axios.post(
    `${BASE_URL}/login`,
    { username: 'admin', password: 'admin123' },
    { withCredentials: false }
  );
  const token = res.data.access_token as string;
  localStorage.setItem('ssps_token', token);
  return token;
}

// ── API calls ──────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  await ensureAuth();
  const res = await api.get('/products', { params: { limit: 10000 } });
  return res.data.products as Product[];
}

export async function updateStock(sku: string, currentStock: number): Promise<Product> {
  await ensureAuth();
  const res = await api.put(`/products/${encodeURIComponent(sku)}`, { currentStock });
  return res.data as Product;
}

export async function deleteProductApi(sku: string): Promise<void> {
  await ensureAuth();
  await api.delete(`/products/${encodeURIComponent(sku)}`);
}

export async function addOrUpdateProductApi(product: Product): Promise<Product> {
  await ensureAuth();
  const res = await api.post('/products', product);
  return res.data as Product;
}

export async function uploadProductsApi(
  file: File
): Promise<{ inserted: number; updated: number; skipped: number; errors: number; error_details?: string[] }> {
  await ensureAuth();
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
  return res.data;
}