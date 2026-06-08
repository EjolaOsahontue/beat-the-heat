-- ==================================================================================
-- BTH+ STORE SUPABASE SCHEMA - OPEN ACCESS (ALL USERS CAN READ/WRITE/UPDATE/DELETE)
-- This schema enables Row Level Security (RLS) with permissive policies
-- WARNING: This allows ALL users unrestricted access to all data
-- ==================================================================================

-- ==================================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ==================================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotional_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ==================================================================================
-- 1. PRODUCTS TABLE - FULL ACCESS POLICIES
-- ==================================================================================

-- Allow all users to SELECT (read) products
CREATE POLICY "Allow all users to read products" ON products
  FOR SELECT
  USING (true);

-- Allow all users to INSERT (create) products
CREATE POLICY "Allow all users to create products" ON products
  FOR INSERT
  WITH CHECK (true);

-- Allow all users to UPDATE products
CREATE POLICY "Allow all users to update products" ON products
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow all users to DELETE products
CREATE POLICY "Allow all users to delete products" ON products
  FOR DELETE
  USING (true);

-- ==================================================================================
-- 2. SITE CONTENT TABLE - FULL ACCESS POLICIES
-- ==================================================================================

CREATE POLICY "Allow all users to read site_content" ON site_content
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all users to create site_content" ON site_content
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all users to update site_content" ON site_content
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all users to delete site_content" ON site_content
  FOR DELETE
  USING (true);

-- ==================================================================================
-- 3. CUSTOMERS TABLE - FULL ACCESS POLICIES
-- ==================================================================================

CREATE POLICY "Allow all users to read customers" ON customers
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all users to create customers" ON customers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all users to update customers" ON customers
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all users to delete customers" ON customers
  FOR DELETE
  USING (true);

-- ==================================================================================
-- 4. CUSTOMER ADDRESSES TABLE - FULL ACCESS POLICIES
-- ==================================================================================

CREATE POLICY "Allow all users to read customer_addresses" ON customer_addresses
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all users to create customer_addresses" ON customer_addresses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all users to update customer_addresses" ON customer_addresses
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all users to delete customer_addresses" ON customer_addresses
  FOR DELETE
  USING (true);

-- ==================================================================================
-- 5. ORDERS TABLE - FULL ACCESS POLICIES
-- ==================================================================================

CREATE POLICY "Allow all users to read orders" ON orders
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all users to create orders" ON orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all users to update orders" ON orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all users to delete orders" ON orders
  FOR DELETE
  USING (true);

-- ==================================================================================
-- 6. ORDER ITEMS TABLE - FULL ACCESS POLICIES
-- ==================================================================================

CREATE POLICY "Allow all users to read order_items" ON order_items
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all users to create order_items" ON order_items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all users to update order_items" ON order_items
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all users to delete order_items" ON order_items
  FOR DELETE
  USING (true);

-- ==================================================================================
-- 7. SHIPPING METHODS TABLE - FULL ACCESS POLICIES
-- ==================================================================================

CREATE POLICY "Allow all users to read shipping_methods" ON shipping_methods
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all users to create shipping_methods" ON shipping_methods
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all users to update shipping_methods" ON shipping_methods
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all users to delete shipping_methods" ON shipping_methods
  FOR DELETE
  USING (true);

-- ==================================================================================
-- 8. ADMIN AUDIT LOGS TABLE - FULL ACCESS POLICIES
-- ==================================================================================

CREATE POLICY "Allow all users to read admin_audit_logs" ON admin_audit_logs
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all users to create admin_audit_logs" ON admin_audit_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all users to update admin_audit_logs" ON admin_audit_logs
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all users to delete admin_audit_logs" ON admin_audit_logs
  FOR DELETE
  USING (true);

-- ==================================================================================
-- 9. PROMOTIONAL CODES TABLE - FULL ACCESS POLICIES
-- ==================================================================================

CREATE POLICY "Allow all users to read promotional_codes" ON promotional_codes
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all users to create promotional_codes" ON promotional_codes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all users to update promotional_codes" ON promotional_codes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all users to delete promotional_codes" ON promotional_codes
  FOR DELETE
  USING (true);

-- ==================================================================================
-- 10. REVIEWS TABLE - FULL ACCESS POLICIES
-- ==================================================================================

CREATE POLICY "Allow all users to read reviews" ON reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all users to create reviews" ON reviews
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all users to update reviews" ON reviews
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all users to delete reviews" ON reviews
  FOR DELETE
  USING (true);

-- ==================================================================================
-- 11. STORAGE BUCKETS - FULL ACCESS POLICIES
-- ==================================================================================
-- NOTE: Storage bucket policies are managed in Supabase Storage panel
-- Below are the recommended policies for open access to storage

-- GALLERY IMAGES BUCKET POLICY
CREATE POLICY "Allow all users to read gallery-images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'gallery-images');

CREATE POLICY "Allow all users to upload to gallery-images" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'gallery-images');

CREATE POLICY "Allow all users to update gallery-images" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'gallery-images')
  WITH CHECK (bucket_id = 'gallery-images');

CREATE POLICY "Allow all users to delete from gallery-images" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'gallery-images');

-- PRODUCT IMAGES BUCKET POLICY
CREATE POLICY "Allow all users to read product-images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Allow all users to upload to product-images" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow all users to update product-images" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow all users to delete from product-images" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'product-images');

-- LANDING IMAGES BUCKET POLICY
CREATE POLICY "Allow all users to read landing-images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'landing-images');

CREATE POLICY "Allow all users to upload to landing-images" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'landing-images');

CREATE POLICY "Allow all users to update landing-images" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'landing-images')
  WITH CHECK (bucket_id = 'landing-images');

CREATE POLICY "Allow all users to delete from landing-images" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'landing-images');

-- ==================================================================================
-- END OF OPEN ACCESS SCHEMA
-- ==================================================================================
-- SUMMARY: All tables now have RLS enabled with policies that allow:
-- - SELECT: All users can read all records
-- - INSERT: All users can create new records
-- - UPDATE: All users can modify any record
-- - DELETE: All users can delete any record
-- ==================================================================================
