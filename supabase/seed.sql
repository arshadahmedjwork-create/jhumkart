-- 1. Seed Categories
INSERT INTO public.categories (id, name, slug, description) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Antique Jhumkas', 'antique-jhumkas', 'Masterpieces inspired by the Victorian era and ancient Indian courts.'),
  ('a2000000-0000-4000-8000-000000000002', 'Temple Jewelry', 'temple-jewelry', 'Sacred adornments inspired by South Indian temple architecture.'),
  ('a3000000-0000-4000-8000-000000000003', 'Bridal Edit', 'bridal-edit', 'Opulent, multi-tiered designs for the majestic Indian bride.')
ON CONFLICT (slug) DO NOTHING;

-- 2. Seed Products
INSERT INTO public.products (id, name, slug, sku, short_description, description, price, stock, category_id, material, finish, status, badges) VALUES
  (
    'b1000000-0000-4000-8000-000000000001', 
    'The Meenakshi Jhumka', 
    'meenakshi-jhumka', 
    'JK-MEEN-001', 
    'Inspired by the architecture of Madurai, featuring revolutionary rotating kinetic axes.', 
    'A masterpiece of engineering and tradition. These earrings feature three rotating tiers of 22K gold, each meticulously hand-carved with motifs from the Meenakshi Temple.', 
    45000, 
    15, 
    'a2000000-0000-4000-8000-000000000002', 
    '22K Gold', 
    'Antique Gold', 
    'active', 
    ARRAY['New Arrival', 'Kinetic Design']
  ),
  (
    'b2000000-0000-4000-8000-000000000002', 
    'Antique Gold Bridal Jhumka', 
    'bridal-gold-jhumka', 
    'JK-BRID-002', 
    'Heavy, opulent, tiered gold design for the majestic bride.', 
    'The cornerstone of our bridal edit. This five-tiered masterpiece weighs over 120 grams of pure 22K gold, featuring intricate filigree work and a peacock crown.', 
    125000, 
    5, 
    'a3000000-0000-4000-8000-000000000003', 
    '22K Gold', 
    'Matte Gold', 
    'active', 
    ARRAY['Bestseller', 'Bridal']
  ),
  (
    'b3000000-0000-4000-8000-000000000003', 
    'Heritage Pearl Drop', 
    'heritage-pearl-drop', 
    'JK-HERI-003', 
    'Classic gold bell shape with delicate Basra pearl hangings.', 
    'A subtle yet striking heritage piece. The gold dome is finished with a unique sand-blasting technique, accented by hand-picked Basra pearls.', 
    32000, 
    20, 
    'a1000000-0000-4000-8000-000000000001', 
    '18K Gold & Pearls', 
    'Satin Finish', 
    'active', 
    ARRAY['Limited Edition']
  )
ON CONFLICT (slug) DO NOTHING;

-- 3. Seed Product Images
INSERT INTO public.product_images (product_id, image_url, is_primary) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1599643478524-fb66f7f2b1d6?q=80&w=800&auto=format&fit=crop', true),
  ('b2000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=800&auto=format&fit=crop', true),
  ('b3000000-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=800&auto=format&fit=crop', true)
ON CONFLICT DO NOTHING;

-- 4. Seed a Drop Sequence
INSERT INTO public.drops (id, title, description, start_time, is_active) VALUES
  ('f1000000-0000-4000-8000-000000000001', 'The Emerald Ascent', 'A curated launch featuring our latest kinetic masterpieces and bridal highlights.', NOW() - INTERVAL '1 day', true)
ON CONFLICT DO NOTHING;

-- 5. Assign Items to Drop
INSERT INTO public.drop_items (drop_id, product_id, display_order) VALUES
  ('f1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 0),
  ('f1000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000002', 1),
  ('f1000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000003', 2)
ON CONFLICT DO NOTHING;
