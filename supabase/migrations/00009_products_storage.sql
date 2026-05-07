-- Create products bucket for image uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
DROP POLICY IF EXISTS "Public product images" ON storage.objects;
CREATE POLICY "Public product images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'products');

-- Allow authenticated users to upload
DROP POLICY IF EXISTS "Auth users upload product images" ON storage.objects;
CREATE POLICY "Auth users upload product images" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their uploads
DROP POLICY IF EXISTS "Auth users delete product images" ON storage.objects;
CREATE POLICY "Auth users delete product images" ON storage.objects 
  FOR DELETE USING (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Also allow anyone to insert product_images records (for admin use)
DROP POLICY IF EXISTS "Anyone can insert product images" ON public.product_images;
CREATE POLICY "Anyone can insert product images" ON public.product_images
  FOR ALL USING (true) WITH CHECK (true);
