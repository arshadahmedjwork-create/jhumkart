import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qkjvthcrppjktgogebqb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFranZ0aGNycHBqa3Rnb2dlYnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTYzNTgsImV4cCI6MjA5MzczMjM1OH0.0RzbqSFRg7hIBLc2eWr99JfkMxCtMle1dCZx4LPIaEg';

const supabase = createClient(supabaseUrl, supabaseKey);

const mockProducts = [
  {
    name: 'Meenakshi Temple Jhumka',
    slug: 'meenakshi-temple-jhumka',
    sku: 'JK-TMP-001',
    short_description: 'Intricate gold carvings with subtle red and green stones.',
    description: 'Intricate gold carvings with subtle red and green stones.',
    price: 45000,
    sale_price: null,
    stock: 15,
    material: '22K Gold',
    finish: 'Antique',
    is_featured: true,
    is_bestseller: true,
    status: 'active',
    images: ['https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop']
  },
  {
    name: 'Antique Gold Bridal Jhumka',
    slug: 'antique-gold-bridal-jhumka',
    sku: 'JK-BRD-002',
    short_description: 'Heavy, opulent, tiered gold design for the majestic bride.',
    description: 'Heavy, opulent, tiered gold design for the majestic bride.',
    price: 125000,
    sale_price: null,
    stock: 5,
    material: '22K Gold',
    finish: 'Antique',
    is_featured: true,
    is_bestseller: false,
    status: 'active',
    images: ['https://images.unsplash.com/photo-1599643478524-fb66f7f2b1d6?q=80&w=800&auto=format&fit=crop']
  },
  {
    name: 'Heritage Pearl Drop Jhumka',
    slug: 'heritage-pearl-drop-jhumka',
    sku: 'JK-ANT-003',
    short_description: 'Classic gold bell shape with delicate pearl hangings.',
    description: 'Classic gold bell shape with delicate pearl hangings.',
    price: 35000,
    sale_price: 32000,
    stock: 20,
    material: '22K Gold',
    finish: 'Matte',
    is_featured: true,
    is_bestseller: true,
    status: 'active',
    images: ['https://images.unsplash.com/photo-1602751584412-700251145538?q=80&w=800&auto=format&fit=crop']
  }
];

async function seed() {
  for (const product of mockProducts) {
    const { images, ...productData } = product;
    const { data: insertedProduct, error: productError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (productError) {
      console.error(`Error inserting product ${product.name}:`, productError);
      continue;
    }

    console.log(`Inserted product: ${insertedProduct.name}`);

    for (const image_url of images) {
      const { error: imageError } = await supabase
        .from('product_images')
        .insert({
          product_id: insertedProduct.id,
          image_url,
          is_primary: true
        });

      if (imageError) {
        console.error(`Error inserting image for ${product.name}:`, imageError);
      }
    }
  }
}

seed();
