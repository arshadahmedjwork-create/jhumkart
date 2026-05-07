import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  
  const isWishlisted = isInWishlist(product.id);
  const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url 
    || product.product_images?.[0]?.image_url 
    || 'https://images.unsplash.com/photo-1599643478524-fb66f7f2b1d6?q=80&w=600&auto=format&fit=crop'; // Fallback if no images are loaded

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    addToCart(product);
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] bg-[#F7F1E6] mb-4 border border-[#C99A45]/30 overflow-hidden flex items-center justify-center p-6 group-hover:shadow-[0_8px_30px_rgb(6,37,27,0.08)] transition-all duration-500">
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.badges?.map(badge => (
            <span key={badge} className="bg-[#C99A45] text-[#06251B] text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
              {badge}
            </span>
          ))}
          {product.stock <= product.low_stock_threshold && product.stock > 0 && (
            <span className="bg-[#8A6B4A] text-[#F7F1E6] text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
              Low Stock
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-[#1A1510] text-[#F7F1E6] text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#F7F1E6]/80 flex items-center justify-center text-[#06251B] hover:text-[#C99A45] transition-colors"
        >
          <Heart size={16} fill={isWishlisted ? "#C99A45" : "none"} color={isWishlisted ? "#C99A45" : "currentColor"} />
        </button>

        {/* Image */}
        <img 
          src={primaryImage} 
          alt={product.name} 
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
        />

        {/* Quick Add Overlay (Desktop) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-[#0F3D2E] text-[#F7F1E6] py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#C99A45] hover:text-[#06251B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} />
            Quick Add
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col items-start px-1">
        <h3 className="font-serif text-lg text-[#06251B] mb-1 group-hover:text-[#C99A45] transition-colors line-clamp-1">{product.name}</h3>
        <p className="text-[#8A6B4A] text-xs mb-2 line-clamp-1">{product.short_description}</p>
        
        <div className="flex justify-between items-center w-full mt-auto">
          <div className="flex flex-col">
            {product.sale_price ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#8A6B4A] line-through">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="text-lg text-[#06251B] font-semibold">₹{product.sale_price.toLocaleString('en-IN')}</span>
              </div>
            ) : (
              <span className="text-lg text-[#06251B] font-semibold">₹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>
          
          {/* Mobile Quick Add */}
          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="md:hidden w-8 h-8 rounded-full border border-[#C99A45] flex items-center justify-center text-[#0F3D2E] disabled:opacity-50"
          >
            <ShoppingBag size={14} />
          </button>
        </div>
      </div>
    </Link>
  );
}
