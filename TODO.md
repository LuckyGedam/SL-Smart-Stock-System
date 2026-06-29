# TODO - Backend production fixes

## Step 1
- [ ] Fix ProductOut mapping for POST/PUT by returning data consistent with response_model
  - [ ] Update `serialize_product()` to return `created_at`/`updated_at` as datetime (not strings)
  - [ ] Update POST/PUT routes to return `serialize_product(orm_obj)`

## Step 2
- [ ] Optimize POST /api/upload to prevent timeouts
  - [ ] Prefetch existing products by SKU (single query)
  - [ ] Bulk insert/update where possible
  - [ ] Use one transaction, one commit, rollback on failure
  - [ ] Remove per-row refresh()

## Step 3
- [ ] Run backend audit for response_model mismatch across routes
  - [ ] Ensure every POST/PUT endpoint returns exactly the declared response_model

## Step 4
- [ ] Test endpoints end-to-end
  - [ ] POST /api/products => 200
  - [ ] POST /api/upload => 200
  - [ ] GET /api/products => 200
  - [ ] No ResponseValidationError, no SQLAlchemy/Pydantic errors

