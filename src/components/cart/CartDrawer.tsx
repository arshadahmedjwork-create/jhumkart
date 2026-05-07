import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/store/useCart';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice } = useCart();

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setIsOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#06251B]/60 z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[400px] bg-[#F7F1E6] z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#C99A45]/30 bg-[#0F3D2E] text-[#C99A45]">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} />
                <h2 className="font-serif text-xl uppercase tracking-widest">Your Cart</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-[#F7F1E6] transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#8A6B4A] gap-4">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="uppercase tracking-widest text-sm">Your cart is empty.</p>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="mt-4 border border-[#0F3D2E] text-[#0F3D2E] px-8 py-3 uppercase tracking-widest text-xs font-semibold hover:bg-[#0F3D2E] hover:text-[#F7F1E6] transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const product = item.product;
                  if (!product) return null; // Guard against missing product data

                  const price = product.sale_price || product.price;
                  const image = product.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1599643478524-fb66f7f2b1d6?q=80&w=600&auto=format&fit=crop';
                  
                  return (
                    <div key={product.id} className="flex gap-4 border-b border-[#C99A45]/20 pb-6">
                      <div className="w-24 h-24 bg-[#E8E1D5] flex-shrink-0 border border-[#C99A45]/20 flex items-center justify-center">
                        <img src={image} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <Link 
                            to={`/product/${item.product.slug}`} 
                            onClick={() => setIsOpen(false)}
                            className="font-serif text-[#06251B] hover:text-[#C99A45] transition-colors line-clamp-2 pr-4"
                          >
                            {item.product.name}
                          </Link>
                          <button 
                            onClick={() => removeItem(item.product.id)}
                            className="text-[#8A6B4A] hover:text-red-500 transition-colors mt-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        
                        <span className="text-[#8A6B4A] text-xs uppercase tracking-widest mb-auto">
                          SKU: {item.product.sku}
                        </span>
                        
                        <div className="flex items-end justify-between mt-4">
                          <div className="flex items-center border border-[#8A6B4A]">
                            <button 
                              onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                              className="p-1 text-[#06251B] hover:bg-[#E8E1D5] transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-[#06251B] text-xs font-semibold">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                              className="p-1 text-[#06251B] hover:bg-[#E8E1D5] transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          
                          <span className="font-semibold text-[#06251B]">
                            ₹{(price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[#C99A45]/30 bg-[#E8E1D5] p-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="uppercase tracking-widest text-[#8A6B4A] text-sm font-semibold">Subtotal</span>
                  <span className="font-serif text-2xl text-[#06251B]">
                    ₹{totalPrice().toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-[#8A6B4A] mb-4 text-center">Shipping & taxes calculated at checkout.</p>
                <Link 
                  to="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-[#0F3D2E] text-[#C99A45] py-4 text-center uppercase tracking-widest text-sm font-semibold hover:bg-[#C99A45] hover:text-[#06251B] transition-colors"
                >
                  Proceed to Checkout
                </Link>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="block w-full mt-4 text-center uppercase tracking-widest text-xs text-[#8A6B4A] hover:text-[#06251B] font-semibold transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
