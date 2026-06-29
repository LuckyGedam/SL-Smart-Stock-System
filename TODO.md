# TODO - image_url support

- [x] Add `image_url` column to backend ProductORM (keep legacy `image`)
- [x] Add `image_url` to frontend `Product` type
- [x] Update Excel upload parser to read optional `url` column -> `image_url` (and sync legacy `image`)
- [x] Update backend CRUD mapping (_build) to persist `image_url`
- [x] Update API serialize_product to include `image_url`
- [ ] Frontend: update all thumbnails to use `product.image_url || product.image` and fall back to `/placeholder.png` on error
- [ ] Frontend: update ProductDetailModal image
- [ ] Ensure backend schemas include `image_url` in ProductOut/Create/Update
- [ ] Add PostgreSQL-safe migration / verify new column creation
- [ ] Run quick backend compile checks and frontend typecheck/build if available
- [ ] Commit all changes

