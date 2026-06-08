-- ==================================================================================
-- BTH+ STORE SUPABASE SCHEMA
-- Complete database schema with authentication, tables, and Row Level Security (RLS)
-- ==================================================================================

-- ==================================================================================
-- 1. PRODUCTS TABLE
-- ==================================================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  base_price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2),
  total_stock INT DEFAULT 0,
  variation_stock JSONB, -- Stores stock by variation/SKU
  images TEXT[], -- Array of image URLs
  variants JSONB, -- SKU variants with options
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_base_price CHECK (base_price > 0)
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);

-- ==================================================================================
-- 2. SITE CONTENT TABLE
-- Store dynamic content (about text, landing background, etc.)
-- ==================================================================================
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO site_content (key, value) VALUES
  ('landing_background', 'https://via.placeholder.com/1920x1080?text=BTH+Hero'),
  ('about_us', 'BTH+ is a curated collection of premium essentials with minimalist design aesthetics.'),
  ('site_name', 'BTH+ Essentials'),
  ('site_tagline', 'Elegant. Timeless. Essential.')
ON CONFLICT (key) DO NOTHING;

-- ==================================================================================
-- 3. CUSTOMERS TABLE
-- User profile information
-- ==================================================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  profile_picture_url VARCHAR(500),
  country VARCHAR(100),
  default_address_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);

-- ==================================================================================
-- 4. CUSTOMER ADDRESSES TABLE
-- Multiple addresses per customer (shipping, billing)
-- ==================================================================================
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL,
  address_type VARCHAR(50), -- 'shipping' or 'billing'
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);

-- ==================================================================================
-- 5. ORDERS TABLE
-- Complete order information
-- ==================================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  payment_method VARCHAR(50), -- 'paystack', 'transfer', etc.
  payment_reference VARCHAR(255) UNIQUE,
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  shipping_address_id UUID REFERENCES customer_addresses(id),
  shipping_method_name VARCHAR(100),
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tracking_number VARCHAR(100),
  order_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_payment_reference ON orders(payment_reference);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ==================================================================================
-- 6. ORDER ITEMS TABLE
-- Individual line items in an order
-- ==================================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  sku_name VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  variant_options JSONB, -- Selected variant choices
  subtotal DECIMAL(12, 2) GENERATED ALWAYS AS (price * quantity) STORED
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ==================================================================================
-- 7. SHIPPING METHODS TABLE
-- Available shipping options
-- ==================================================================================
CREATE TABLE IF NOT EXISTS shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  base_cost DECIMAL(10, 2) NOT NULL,
  estimated_days INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO shipping_methods (name, description, base_cost, estimated_days) VALUES
  ('Standard Shipping', 'Delivery in 5-7 business days', 500.00, 7),
  ('Express Shipping', 'Delivery in 2-3 business days', 1500.00, 3),
  ('Overnight Shipping', 'Next business day delivery', 3000.00, 1),
  ('Store Pickup', 'Pick up from our store', 0.00, 0)
ON CONFLICT DO NOTHING;

-- ==================================================================================
-- 8. ADMIN AUDIT LOG
-- Track all admin actions for security
-- ==================================================================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  changes JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_logs_admin_email ON admin_audit_logs(admin_email);
CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);

-- ==================================================================================
-- 9. PROMOTIONAL CODES TABLE
-- Coupon/discount codes
-- ==================================================================================
CREATE TABLE IF NOT EXISTS promotional_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20), -- 'percentage' or 'fixed_amount'
  discount_value DECIMAL(10, 2) NOT NULL,
  max_uses INT,
  uses_count INT DEFAULT 0,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promo_codes_code ON promotional_codes(code);
CREATE INDEX idx_promo_codes_valid_until ON promotional_codes(valid_until);

-- ==================================================================================
-- 10. REVIEWS TABLE
-- Customer product reviews
-- ==================================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);

-- ==================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Control access to data based on user roles
-- ==================================================================================

-- Enable RLS on all tables
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

-- PRODUCTS: Public read access, admin-only write
CREATE POLICY "products_public_read" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "products_admin_write" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "products_admin_update" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "products_admin_delete" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- SITE CONTENT: Public read access
CREATE POLICY "site_content_public_read" ON site_content FOR SELECT USING (TRUE);

-- CUSTOMERS: Users can see/edit their own profile
CREATE POLICY "customers_read_own" ON customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "customers_insert_own" ON customers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "customers_update_own" ON customers FOR UPDATE USING (auth.uid() = id);

-- CUSTOMER ADDRESSES: Users can see/edit their own addresses
CREATE POLICY "addresses_read_own" ON customer_addresses FOR SELECT 
  USING (customer_id = auth.uid());
CREATE POLICY "addresses_insert_own" ON customer_addresses FOR INSERT 
  WITH CHECK (customer_id = auth.uid());
CREATE POLICY "addresses_update_own" ON customer_addresses FOR UPDATE 
  USING (customer_id = auth.uid());

-- ORDERS: Users can see their own orders
CREATE POLICY "orders_read_own" ON orders FOR SELECT 
  USING (customer_id = auth.uid() OR auth.uid() IS NULL);
CREATE POLICY "orders_insert_own" ON orders FOR INSERT 
  WITH CHECK (auth.uid() IS NULL OR customer_id = auth.uid());

-- PROMOTIONAL CODES: Public read (active only)
CREATE POLICY "promo_codes_public_read" ON promotional_codes FOR SELECT 
  USING (is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW()));

-- REVIEWS: Public read, authenticated users can insert
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT 
  USING (is_approved = TRUE);
CREATE POLICY "reviews_insert_authenticated" ON reviews FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- ==================================================================================
-- ENVIRONMENT VARIABLES REFERENCE
-- Add these to your .env.local file:
-- ==================================================================================
-- NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
-- NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
-- SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (for admin operations)

-- ==================================================================================
-- USEFUL QUERIES FOR TESTING
-- ==================================================================================

-- Get all active products with stock > 0
-- SELECT * FROM products WHERE is_active = TRUE AND stock > 0;

-- Get recent orders
-- SELECT id, customer_email, total_amount, order_status, created_at FROM orders ORDER BY created_at DESC LIMIT 10;

-- Get customer order history
-- SELECT o.id, o.total_amount, o.order_status, o.created_at FROM orders o 
-- WHERE o.customer_id = 'customer-uuid' ORDER BY o.created_at DESC;

-- Get order items with product details
-- SELECT oi.*, p.name, p.images FROM order_items oi 
-- JOIN products p ON oi.product_id = p.id WHERE oi.order_id = 'order-uuid';

-- ==================================================================================
-- MIGRATION NOTES
-- If migrating from BTH, update customer references and ensure order history is preserved
-- ==================================================================================

-- ==================================================================================
-- MIGRATION: ADD BASE_PRICE COLUMN IF IT DOESN'T EXIST
-- Run this if you already have a products table without base_price column
-- ==================================================================================
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS base_price DECIMAL(10, 2);
-- UPDATE products SET base_price = price WHERE base_price IS NULL;
-- ALTER TABLE products ALTER COLUMN base_price SET NOT NULL;
-- ALTER TABLE products ADD CONSTRAINT valid_base_price CHECK (base_price > 0);
-- ==================================================================================
