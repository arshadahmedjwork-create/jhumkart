-- Initial Schema for Jhumkart

-- Create is_admin helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles
CREATE TABLE public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
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
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
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
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Products
CREATE TABLE public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  sku text unique not null,
  short_description text,
  description text,
  price numeric not null check (price >= 0),
  sale_price numeric check (sale_price >= 0),
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
  status text default 'draft' check (status in ('active', 'draft', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Product Images
CREATE TABLE public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order int default 0,
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
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
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Carts
CREATE TABLE public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text, -- For guest carts
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Cart Items
CREATE TABLE public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references public.carts(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(cart_id, product_id)
);

-- Wishlists
CREATE TABLE public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Wishlist Items
CREATE TABLE public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid references public.wishlists(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(wishlist_id, product_id)
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
  subtotal numeric,
  discount numeric default 0,
  shipping_fee numeric default 0,
  total numeric not null,
  coupon_code text,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  order_status text default 'pending' check (order_status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  razorpay_order_id text,
  razorpay_payment_id text,
  tracking_id text,
  courier_partner text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Order Items
CREATE TABLE public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  sku text,
  product_name text,
  quantity int,
  price numeric,
  total numeric,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Coupons
CREATE TABLE public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text check (discount_type in ('percentage', 'fixed')),
  discount_value numeric,
  minimum_order_value numeric,
  maximum_discount numeric,
  usage_limit int,
  used_count int default 0,
  expires_at timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Inventory Logs
CREATE TABLE public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  sku text,
  change_type text,
  quantity_change int,
  previous_stock int,
  new_stock int,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Homepage Content
CREATE TABLE public.homepage_content (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);


-- ROW LEVEL SECURITY (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile. Admin can do all.
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Categories, Collections, Products, Product Images: Public read if active. Admin all.
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view active collections" ON public.collections FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage collections" ON public.collections FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (status = 'active');
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins manage product images" ON public.product_images FOR ALL USING (public.is_admin());

-- Addresses: Users manage own. Admin all.
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all addresses" ON public.addresses FOR ALL USING (public.is_admin());

-- Carts & Wishlists: Users manage own. 
CREATE POLICY "Users manage own cart" ON public.carts FOR ALL USING (auth.uid() = user_id OR session_id = current_setting('request.headers')::json->>'x-session-id');
CREATE POLICY "Users manage own cart items" ON public.cart_items FOR ALL USING (cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid() OR session_id = current_setting('request.headers')::json->>'x-session-id'));

CREATE POLICY "Users manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own wishlist items" ON public.wishlist_items FOR ALL USING (wishlist_id IN (SELECT id FROM public.wishlists WHERE user_id = auth.uid()));

-- Orders: Users view own. Admin manage all.
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL USING (public.is_admin());

-- Admin only tables
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage inventory logs" ON public.inventory_logs FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage homepage content" ON public.homepage_content FOR ALL USING (public.is_admin());
CREATE POLICY "Public can view homepage content" ON public.homepage_content FOR SELECT USING (true);


-- Storage Policies (Requires manually creating buckets or using script if preferred, but assuming buckets exist)
-- Buckets: product-images, category-images, collection-banners, homepage-assets

-- Function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
