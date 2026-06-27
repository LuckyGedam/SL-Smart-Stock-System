# SSPS Backend (Express)

## Run
- `npm run server`

Server listens on `http://localhost:4000` by default.

## Endpoints
- `GET /api/products` => { products }
- `GET /api/products/:sku` => { product }
- `PUT /api/products/:sku/stock` body: { currentStock: number } => { product }
- `POST /api/products` body: Product => { product, upserted: boolean }
- `DELETE /api/products/:sku` => 204
- `POST /api/products/bulk-upload` body: { products: Product[] } => { created, updated }

