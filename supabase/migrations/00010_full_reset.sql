-- ============================================
-- JHUMKART: COMPLETE DATABASE RESET
-- Run this in the Supabase SQL Editor to nuke
-- everything and start fresh.
-- ============================================

-- 1. DROP ALL EXISTING TABLES (cascade removes policies, triggers, etc.)
DROP TABLE IF EXISTS public.inventory_logs CASCADE;
DROP TABLE IF EXISTS public.homepage_content CASCADE;
DROP TABLE IF EXISTS public.wishlist_items CASCADE;
DROP TABLE IF EXISTS public.wishlists CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.carts CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.drops CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. DROP FUNCTIONS & TRIGGERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- ============================================
-- 3. RECREATE FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. RECREATE TABLES
-- ============================================

-- Profiles
CREATE TABLE public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Categories
CREATE TABLE public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Collections
CREATE TABLE public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  banner_url text,
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Products
CREATE TABLE public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  sku text not null,
  short_description text,
  description text,
  price numeric not null default 0,
  sale_price numeric,
  stock int default 0,
  reserved_stock int default 0,
  low_stock_threshold int default 5,
  category_id uuid references public.categories(id) on delete set null,
  collection_id uuid references public.collections(id) on delete set null,
  material text,
  finish text,
  weight text,
  dimensions text,
  occasion_tags text[],
  badges text[],
  is_featured boolean default false,
  is_bestseller boolean default false,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Product Images
CREATE TABLE public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order int default 0,
  is_primary boolean default false,
  created_at timestamptz default now()
);

-- Addresses
CREATE TABLE public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  pincode text,
  country text default 'India',
  type text default 'shipping',
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Drops (flash sales)
CREATE TABLE public.drops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  banner_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders
CREATE TABLE public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text,
  customer_email text,
  customer_phone text,
  shipping_address jsonb,
  subtotal numeric default 0,
  discount numeric default 0,
  shipping_fee numeric default 0,
  total numeric not null,
  coupon_code text,
  payment_status text default 'pending',
  order_status text default 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  tracking_id text,
  courier_partner text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order Items
CREATE TABLE public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  sku text,
  product_name text,
  quantity int default 1,
  price numeric default 0,
  total numeric default 0,
  created_at timestamptz default now()
);

-- Wishlists
CREATE TABLE public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  created_at timestamptz default now()
);

-- Wishlist Items
CREATE TABLE public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid references public.wishlists(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(wishlist_id, product_id)
);

-- Coupons
CREATE TABLE public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text,
  discount_value numeric,
  minimum_order_value numeric,
  maximum_discount numeric,
  usage_limit int,
  used_count int default 0,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Homepage Content
CREATE TABLE public.homepage_content (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb,
  updated_at timestamptz default now()
);

-- ============================================
-- 5. ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS POLICIES (SIMPLE & PERMISSIVE)
-- ============================================

-- Profiles: users read/update own, open insert for trigger
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Public read tables (categories, collections, products, images, drops, homepage)
CREATE POLICY "categories_public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_admin" ON public.categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "collections_public" ON public.collections FOR SELECT USING (true);
CREATE POLICY "collections_admin" ON public.collections FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "products_public" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_admin" ON public.products FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "product_images_public" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "product_images_admin" ON public.product_images FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "drops_public" ON public.drops FOR SELECT USING (true);
CREATE POLICY "drops_admin" ON public.drops FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "homepage_public" ON public.homepage_content FOR SELECT USING (true);
CREATE POLICY "homepage_admin" ON public.homepage_content FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Addresses: users manage own
CREATE POLICY "addresses_user" ON public.addresses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Orders: authenticated users can INSERT, users read own, admin manages all
CREATE POLICY "orders_insert" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "orders_select" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "orders_admin" ON public.orders FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "order_items_insert" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_select" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "order_items_admin" ON public.order_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Wishlists
CREATE POLICY "wishlists_user" ON public.wishlists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlist_items_user" ON public.wishlist_items FOR ALL USING (true) WITH CHECK (true);

-- Coupons: public read, admin manage
CREATE POLICY "coupons_public" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "coupons_admin" ON public.coupons FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================
-- 7. GRANTS (PostgREST needs these)
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- 8. TRIGGER: Auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 9. STORAGE BUCKET
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 10. RE-SEED: Create profiles for existing auth users
-- ============================================

INSERT INTO public.profiles (id, full_name, role)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'User'),
  'customer'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
