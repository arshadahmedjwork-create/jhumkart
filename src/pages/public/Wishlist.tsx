import { Link } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import { useWishlist } from '@/store/useWishlist';
import { useCart } from '@/store/useCart';

export function Wishlist() {
  const { items, removeItem } = useWishlist();
  const { addItem, setIsOpen: setCartOpen } = useCart();

  const handleAddToCart = (product: any) => {
    addItem(product);
    setCartOpen(true);
  };

  return (
    <div className="bg-[#F7F1E6] min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-[#06251B] mb-6">Your Wishlist</h1>
          <div className="w-16 h-[1px] bg-[#C99A45] mx-auto"></div>
        </div>

        {items.length === 0 ? (
          <div className="text-center text-[#8A6B4A] py-16">
            <HeartEmptyIcon className="w-16 h-16 mx-auto mb-6 text-[#C99A45] opacity-50" />
            <p className="text-lg mb-8 font-light">Your heart hasn't found its match yet.</p>
            <Link 
              to="/shop" 
              className="inline-block bg-[#0F3D2E] text-[#C99A45] px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#C99A45] hover:text-[#06251B] transition-colors"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((product) => {
              if (!product || !product.id) return null; // Guard

              const image = product.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1599643478524-fb66f7f2b1d6?q=80&w=600&auto=format&fit=crop';
              const price = product.sale_price || product.price;

              return (
                <div key={product.id} className="group relative bg-white border border-[#C99A45]/20 overflow-hidden flex flex-col">
                  {/* Remove Button */}
                  <button 
                    onClick={() => removeItem(product.id)}
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-[#8A6B4A] hover:text-red-500 hover:bg-white transition-all shadow-sm"
                  >
                    <X size={16} />
                  </button>

                  <Link to={`/product/${product.slug}`} className="block h-72 bg-[#E8E1D5] overflow-hidden">
                    <img 
                      src={image} 
                      alt={product.name} 
                      className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>

                  <div className="p-6 flex flex-col flex-grow text-center border-t border-[#C99A45]/20">
                    <h3 className="font-serif text-[#06251B] text-lg mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-[#8A6B4A] text-sm mb-4">₹{price.toLocaleString('en-IN')}</p>
                    
                    <div className="mt-auto pt-4">
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="w-full flex items-center justify-center gap-2 border border-[#06251B] text-[#06251B] py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#06251B] hover:text-[#F7F1E6] transition-colors"
                      >
                        <ShoppingBag size={14} /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function HeartEmptyIcon(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
