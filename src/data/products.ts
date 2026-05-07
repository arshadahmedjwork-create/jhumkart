import type { Product } from '@/types';

export const mockProducts: Product[] = [
  {
    id: '1',
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
    badges: ['Bestseller'],
    is_featured: true,
    is_bestseller: true,
    status: 'active',
    product_images: [{ id: '1', product_id: '1', image_url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80\u0026w=800\u0026auto=format\u0026fit=crop', alt_text: '', display_order: 1, is_primary: true }]
  },
  {
    id: '2',
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
    badges: ['New Arrival'],
    is_featured: true,
    is_bestseller: false,
    status: 'active',
    product_images: [{ id: '2', product_id: '2', image_url: 'https://images.unsplash.com/photo-1599643478524-fb66f7f2b1d6?q=80\u0026w=800\u0026auto=format\u0026fit=crop', alt_text: '', display_order: 1, is_primary: true }]
  },
  {
    id: '3',
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
    badges: ['Trending'],
    is_featured: true,
    is_bestseller: true,
    status: 'active',
    product_images: [{ id: '3', product_id: '3', image_url: 'https://images.unsplash.com/photo-1602751584412-700251145538?q=80\u0026w=800\u0026auto=format\u0026fit=crop', alt_text: '', display_order: 1, is_primary: true }]
  }
];
