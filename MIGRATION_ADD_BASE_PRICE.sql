-- ==================================================================================
-- MIGRATION: Update products table schema
-- ==================================================================================
-- Run this script if you already have a products table and need to:
-- 1. Add/update base_price column
-- 2. Remove old price column
-- 3. Add total_stock and variation_stock columns
-- 4. Convert images from JSONB to TEXT[]
-- ==================================================================================

-- Step 1: Add base_price column if it doesn't exist (copy from price if exists)
ALTER TABLE products ADD COLUMN IF NOT EXISTS base_price DECIMAL(10, 2);
UPDATE products 
SET base_price = COALESCE(base_price, (
  SELECT price FROM products AS p WHERE p.id = products.id LIMIT 1
))
WHERE base_price IS NULL AND EXISTS (SELECT 1 FROM products WHERE price IS NOT NULL LIMIT 1);

-- Step 2: Make base_price NOT NULL
ALTER TABLE products ALTER COLUMN base_price SET NOT NULL;

-- Step 3: Add total_stock column if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_stock INT DEFAULT 0;
UPDATE products SET total_stock = COALESCE((SELECT stock FROM products WHERE id = products.id LIMIT 1), 0) 
WHERE total_stock = 0 AND EXISTS (SELECT 1 FROM products WHERE stock IS NOT NULL LIMIT 1);

-- Step 4: Add variation_stock column if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS variation_stock JSONB;

-- Step 5: Convert images from JSONB to TEXT[] if needed
-- This step depends on your current data structure
-- ALTER TABLE products ALTER COLUMN images TYPE TEXT[];

-- Step 6: Drop old columns (OPTIONAL - do this after verifying data migration)
-- ALTER TABLE products DROP COLUMN IF EXISTS price;
-- ALTER TABLE products DROP COLUMN IF EXISTS stock;

-- Step 7: Add check constraint for base_price
ALTER TABLE products ADD CONSTRAINT valid_base_price CHECK (base_price > 0);

-- Step 8: Verify the migration
SELECT COUNT(*) as total_products, 
       COUNT(CASE WHEN base_price IS NULL THEN 1 END) as products_without_base_price,
       COUNT(CASE WHEN total_stock IS NULL THEN 1 END) as products_without_total_stock
FROM products;

-- ==================================================================================
-- RESULT: 
-- - Products now have base_price (required), total_stock, and variation_stock
-- - Records without base_price count should be 0
-- ==================================================================================
