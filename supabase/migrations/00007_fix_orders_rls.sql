-- 1. Permissive policy for orders
DROP POLICY IF EXISTS "Users can place orders" ON public.orders;
CREATE POLICY "Users can place orders" ON public.orders
  FOR ALL USING (true) WITH CHECK (true);

-- 2. Permissive policy for order_items
DROP POLICY IF EXISTS "Users can add order items" ON public.order_items;
CREATE POLICY "Users can add order items" ON public.order_items
  FOR ALL USING (true) WITH CHECK (true);

-- 3. Ensure profiles can be updated by anyone for now
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);
