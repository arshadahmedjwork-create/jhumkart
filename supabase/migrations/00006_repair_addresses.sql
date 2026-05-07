-- 1. Drop the existing table to start fresh and avoid mismatches
DROP TABLE IF EXISTS public.addresses CASCADE;

-- 2. Recreate with the exact expected schema
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
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Enable RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- 4. Set up broad management policy for users
DROP POLICY IF EXISTS "Users manage own addresses" ON public.addresses;
CREATE POLICY "Users manage own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id);

-- 5. Admin policy
DROP POLICY IF EXISTS "Admins manage all addresses" ON public.addresses;
CREATE POLICY "Admins manage all addresses" ON public.addresses
  FOR ALL USING (public.is_admin());
