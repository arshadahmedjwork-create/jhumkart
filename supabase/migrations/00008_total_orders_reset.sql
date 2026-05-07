-- 1. Drop existing tables to clear any locks or corrupt indexes
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;

-- 2. Recreate Orders table with high-stability defaults
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
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Recreate Order Items table
CREATE TABLE public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  sku text,
  product_name text,
  quantity int default 1,
  price numeric default 0,
  total numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Enable RLS and set to PERMISSIVE for the acquisition flow
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Orders All Access" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Order Items All Access" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

-- 5. Grant permissions to anonymous/authenticated users (PostgREST requirement)
GRANT ALL ON public.orders TO anon, authenticated;
GRANT ALL ON public.order_items TO anon, authenticated;
