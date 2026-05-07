import type { User as _User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  is_featured: boolean;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  short_description: string | null;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  low_stock_threshold: number;
  category_id: string | null;
  collection_id: string | null;
  material: string | null;
  finish: string | null;
  weight: string | null;
  dimensions: string | null;
  occasion_tags: string[];
  badges: string[];
  is_featured: boolean;
  is_bestseller: boolean;
  status: 'active' | 'draft' | 'archived';
  product_images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  product_id: string;
  product?: Product;
}
