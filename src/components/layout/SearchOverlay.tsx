import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { mockProducts } from '@/data/products';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Lock body scroll and focus input when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
      setResults([]);
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  // Handle Search
  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // Try Supabase first
        let { data, error } = await supabase
          .from('products')
          .select('id, name, slug, price, sale_price, product_images(image_url)')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .eq('status', 'active')
          .limit(5);

        // If no results or error, search mock data
        if (!data || data.length === 0) {
          const searchTerms = query.toLowerCase().split(' ');
          const mockResults = mockProducts.filter(p => {
            const nameMatch = searchTerms.every(term => p.name.toLowerCase().includes(term));
            const descMatch = p.description?.toLowerCase().includes(query.toLowerCase());
            return nameMatch || descMatch;
          }).slice(0, 5);
          
          setResults(mockResults);
        } else {
          setResults(data);
        }
      } catch (err) {
        console.error("Search error:", err);
        // Fallback to mock on error
        const searchTerms = query.toLowerCase().split(' ');
        const mockResults = mockProducts.filter(p => 
          searchTerms.every(term => p.name.toLowerCase().includes(term))
        ).slice(0, 5);
        setResults(mockResults);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleResultClick = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#F7F1E6]/95 backdrop-blur-md flex flex-col"
        >
          {/* Header */}
          <div className="container mx-auto px-4 md:px-8 py-8 flex justify-end">
            <button 
              onClick={onClose}
              className="text-[#06251B] hover:text-[#C99A45] transition-colors p-2"
            >
              <X size={32} strokeWidth={1.5} />
            </button>
          </div>

          {/* Search Input Area */}
          <div className="container mx-auto px-4 md:px-8 flex flex-col items-center flex-1 mt-10">
            <div className="w-full max-w-4xl relative border-b-2 border-[#06251B] pb-4 mb-12">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-[#06251B]" size={28} />
              <input 
                ref={inputRef}
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for Jhumkas, Necklaces, Collections..." 
                className="w-full bg-transparent text-2xl md:text-4xl text-[#06251B] placeholder-[#8A6B4A]/50 pl-12 pr-4 focus:outline-none font-serif"
              />
            </div>

            {/* Results */}
            <div className="w-full max-w-4xl flex-1 overflow-y-auto pb-12">
              {isSearching ? (
                <div className="text-center text-[#8A6B4A] uppercase tracking-widest text-sm">Searching...</div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {results.map((product) => {
                    const price = product.sale_price || product.price;
                    const image = product.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1599643478524-fb66f7f2b1d6?q=80&w=600&auto=format&fit=crop';
                    
                    return (
                      <div 
                        key={product.id} 
                        onClick={() => handleResultClick(product.slug)}
                        className="group cursor-pointer flex items-center gap-4 bg-white p-3 border border-[#C99A45]/20 hover:border-[#C99A45] transition-all"
                      >
                        <div className="w-16 h-16 bg-[#E8E1D5] flex-shrink-0">
                          <img src={image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                        </div>
                        <div>
                          <h4 className="font-serif text-[#06251B] group-hover:text-[#C99A45] transition-colors text-sm line-clamp-1">{product.name}</h4>
                          <span className="text-[#8A6B4A] text-xs">₹{price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : query.length >= 2 ? (
                <div className="text-center text-[#8A6B4A]">
                  <p className="font-serif text-xl mb-2">No results found for "{query}"</p>
                  <p className="text-sm">Try checking your spelling or use more general terms.</p>
                </div>
              ) : (
                <div className="hidden md:flex flex-wrap justify-center gap-4 opacity-70">
                  <span className="text-xs uppercase tracking-widest text-[#8A6B4A]">Popular Searches:</span>
                  {['Antique Jhumka', 'Temple Jewelry', 'Bridal Sets', 'Pearl Drops'].map(term => (
                    <button 
                      key={term}
                      onClick={() => setQuery(term)}
                      className="text-xs uppercase tracking-widest text-[#06251B] hover:text-[#C99A45] transition-colors border-b border-[#06251B]/30 hover:border-[#C99A45]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
