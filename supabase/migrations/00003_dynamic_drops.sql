-- Create Drops table
CREATE TABLE public.drops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  is_active boolean default true,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create Drop Items table (junction table between drops and products)
CREATE TABLE public.drop_items (
  id uuid primary key default gen_random_uuid(),
  drop_id uuid references public.drops(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  display_order int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drop_items ENABLE ROW LEVEL SECURITY;

-- Public Policies (View active drops)
CREATE POLICY "Public can view active drops" ON public.drops
  FOR SELECT USING (is_active = true AND (start_time <= now() OR start_time IS NULL));

CREATE POLICY "Public can view drop items" ON public.drop_items
  FOR SELECT USING (drop_id IN (SELECT id FROM public.drops WHERE is_active = true));

-- Admin Policies (Manage all drops)
CREATE POLICY "Admins manage drops" ON public.drops
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins manage drop items" ON public.drop_items
  FOR ALL USING (public.is_admin());
