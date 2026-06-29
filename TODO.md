# TODO

- [x] Inspect backend models and startup path for missing `products.image_url` column.
- [x] Add idempotent startup migration for PostgreSQL: `ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT`.
- [x] Wire migration into backend startup (runs before `init_db()`).
- [ ] Verify runtime: `GET /api/products` returns `image_url` without SQL errors.
- [ ] Deploy/commit changes.

