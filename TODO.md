# TODO - Backend Fix (SSPS)

- [ ] Add Express backend (server/) with REST API for products CRUD + stock update + bulk upload simulation
- [ ] Add in-memory store initialized from src/data/mockProducts.ts
- [ ] Add server scripts to package.json (dev + build/ts-node/tsx)
- [ ] Update frontend to fetch products from backend on load
- [ ] Update AdminPanelModal actions (save/delete/add/excel simulate) to call backend APIs and refresh UI
- [ ] Add minimal error handling + optimistic refresh where needed
- [ ] Run `npm run dev:all` and manually test:
  - stock update
  - delete SKU
  - add SKU
  - barcode lookup after changes
  - CSV reports download reflects latest state

