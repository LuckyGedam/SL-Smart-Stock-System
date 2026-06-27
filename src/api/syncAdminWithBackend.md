Admin API integration note:
- After backend is running, AdminPanelModal should call:
  - PUT /api/products/:sku/stock
  - DELETE /api/products/:sku
  - POST /api/products
  - POST /api/products/bulk-upload
- then reload /api/products and update App state.

