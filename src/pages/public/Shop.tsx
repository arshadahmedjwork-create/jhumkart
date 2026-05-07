import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';
import { mockProducts } from '@/data/products';

export function Shop() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [_isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const initialFilter = searchParams.get('filter');
  
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          supabase.from('products').select('*, product_images(*)').eq('status', 'active'),
          supabase.from('categories').select('*')
        ]);

        if (categoriesRes.data) setCategories(categoriesRes.data);

        let filteredProducts = productsRes.data || [];
        if (initialFilter === 'new') {
          // Sort by created_at or badges
          filteredProducts = filteredProducts.filter(p => p.badges?.includes('New Arrival'));
        } else if (initialFilter === 'bestsellers') {
          filteredProducts = filteredProducts.filter(p => p.is_bestseller);
        }

        setProducts(filteredProducts);
      } catch (error) {
        console.error("Shop fetch failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [initialFilter]);

  return (
    <div className="bg-[#F7F1E6] min-h-screen pb-24">
      {/* Header */}
      <div className="bg-[#0F3D2E] text-[#F7F1E6] py-12 md:py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[#06251B]/40 mix-blend-multiply"></div>
        <div className="container relative mx-auto px-4 z-10">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#C99A45] mb-4">
            {initialFilter === 'new' ? 'New Arrivals' : initialFilter === 'bestsellers' ? 'Bestsellers' : 'Curated Gallery'}
          </h1>
          <p className="text-[#F7F1E6]/80 max-w-xl mx-auto font-light">
            Explore our curated selection of heritage-inspired adornments, meticulously crafted for the discerning eye.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-8">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center py-6 border-b border-[#C99A45]/30 mb-8 gap-4">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 text-[#06251B] uppercase tracking-widest text-sm font-semibold hover:text-[#C99A45] transition-colors w-full md:w-auto justify-center md:justify-start"
          >
            <Filter size={18} />
            Filter & Sort
          </button>
          
          <div className="text-[#8A6B4A] text-sm uppercase tracking-widest">
            Showing {products.length} Artifacts
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {isFilterOpen && (
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white p-6 border border-[#C99A45]/20">
                <div className="mb-6">
                  <h3 className="font-serif text-lg text-[#06251B] mb-4 border-b border-[#C99A45]/20 pb-2">Category</h3>
                  <div className="space-y-3">
                    {categories.map(category => (
                      <label key={category.id} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 accent-[#0F3D2E]" />
                        <span className="text-sm text-[#1A1510] group-hover:text-[#C99A45] transition-colors">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-serif text-lg text-[#06251B] mb-4 border-b border-[#C99A45]/20 pb-2">Material</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 accent-[#0F3D2E]" />
                      <span className="text-sm text-[#1A1510] group-hover:text-[#C99A45]">22K Gold</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 accent-[#0F3D2E]" />
                      <span className="text-sm text-[#1A1510] group-hover:text-[#C99A45]">18K Gold</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-lg text-[#06251B] mb-4 border-b border-[#C99A45]/20 pb-2">Price</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="price" className="w-4 h-4 accent-[#0F3D2E]" />
                      <span className="text-sm text-[#1A1510] group-hover:text-[#C99A45]">Under ₹50,000</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="price" className="w-4 h-4 accent-[#0F3D2E]" />
                      <span className="text-sm text-[#1A1510] group-hover:text-[#C99A45]">₹50,000 - ₹1,00,000</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="price" className="w-4 h-4 accent-[#0F3D2E]" />
                      <span className="text-sm text-[#1A1510] group-hover:text-[#C99A45]">Above ₹1,00,000</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-grow">
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isFilterOpen ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-6`}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {products.length === 0 && (
              <div className="py-24 text-center">
                <p className="text-[#8A6B4A] text-lg font-serif">No adornments found matching your criteria.</p>
                <button 
                  onClick={() => setProducts(mockProducts)}
                  className="mt-6 border border-[#0F3D2E] text-[#0F3D2E] px-8 py-3 uppercase tracking-widest text-sm font-semibold hover:bg-[#0F3D2E] hover:text-[#F7F1E6] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
