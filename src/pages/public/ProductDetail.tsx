import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, ShieldCheck, ChevronRight, Minus, Plus } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import type { Product } from '@/types';

// Mock data (we reuse the same mock for now)
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Meenakshi Temple Jhumka',
    slug: 'meenakshi-temple-jhumka',
    sku: 'JK-TMP-001',
    short_description: 'Intricate gold carvings with subtle red and green stones.',
    description: 'Inspired by the grand architecture of the Meenakshi Temple in Madurai, these jhumkas feature revolutionary rotating kinetic axes that echo the temple bells. Handcrafted by 4th-generation artisans over 140 hours.',
    price: 45000,
    sale_price: null,
    stock: 15,
    category_id: null,
    collection_id: null,
    material: '22K Hallmarked Gold',
    finish: 'Antique Temple Finish',
    weight: '34.5 grams',
    dimensions: 'Length: 3.5 inches, Width: 1.5 inches',
    occasion_tags: ['Bridal', 'Festive'],
    badges: ['Bestseller'],
    is_featured: true,
    is_bestseller: true,
    status: 'active',
    product_images: [{ id: '1', product_id: '1', image_url: '/src/assets/meenakshi.png', alt_text: '', display_order: 1, is_primary: true }]
  }
];

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description'|'details'|'shipping'>('description');
  
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    // Mock fetch
    const found = mockProducts.find(p => p.slug === slug) || mockProducts[0];
    setProduct(found);
    window.scrollTo(0,0);
  }, [slug]);

  if (!product) return <div className="p-24 text-center text-[#8A6B4A]">Loading artifact details...</div>;

  const isWishlisted = isInWishlist(product.id);
  const primaryImage = product.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1599643478524-fb66f7f2b1d6?q=80&w=600&auto=format&fit=crop';

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="bg-[#F7F1E6] min-h-screen">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 md:px-8 py-6 flex items-center text-xs tracking-widest uppercase text-[#8A6B4A]">
        <Link to="/" className="hover:text-[#C99A45] transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-2" />
        <Link to="/shop" className="hover:text-[#C99A45] transition-colors">Shop</Link>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-[#06251B] font-semibold">{product.name}</span>
      </div>

      <div className="container mx-auto px-4 md:px-8 pb-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Image Gallery */}
          <div className="w-full lg:w-1/2">
            <div className="aspect-[4/5] bg-[#E8E1D5] border border-[#C99A45]/30 flex items-center justify-center p-8 sticky top-24">
              <img 
                src={primaryImage} 
                alt={product.name} 
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            {/* Thumbnails could go here if multiple images existed */}
          </div>

          {/* Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="mb-6 flex gap-2">
              {product.badges?.map(badge => (
                <span key={badge} className="bg-[#C99A45] text-[#06251B] text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                  {badge}
                </span>
              ))}
            </div>

            <h1 className="font-serif text-4xl md:text-5xl text-[#06251B] mb-2 leading-tight">
              {product.name}
            </h1>
            <p className="text-[#8A6B4A] text-sm uppercase tracking-widest mb-6">SKU: {product.sku}</p>

            <div className="flex items-end gap-4 mb-8">
              {product.sale_price ? (
                <>
                  <span className="font-serif text-3xl text-[#06251B]">₹{product.sale_price.toLocaleString('en-IN')}</span>
                  <span className="font-serif text-xl text-[#8A6B4A] line-through mb-1">₹{product.price.toLocaleString('en-IN')}</span>
                </>
              ) : (
                <span className="font-serif text-3xl text-[#06251B]">₹{product.price.toLocaleString('en-IN')}</span>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="flex flex-col gap-6 border-y border-[#C99A45]/20 py-8 mb-8">
              <div className="flex items-center justify-between">
                <span className="text-[#06251B] uppercase tracking-widest text-sm font-semibold">Quantity</span>
                <div className="flex items-center border border-[#8A6B4A]">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-3 text-[#06251B] hover:bg-[#E8E1D5] transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center text-[#06251B] font-semibold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="p-3 text-[#06251B] hover:bg-[#E8E1D5] transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-[#0F3D2E] text-[#F7F1E6] py-4 uppercase tracking-widest text-sm font-semibold hover:bg-[#C99A45] hover:text-[#06251B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  <ShoppingBag size={18} />
                  {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                </button>
                <button 
                  onClick={handleWishlistToggle}
                  className="w-14 border border-[#0F3D2E] text-[#0F3D2E] flex justify-center items-center hover:bg-[#0F3D2E] hover:text-[#F7F1E6] transition-colors"
                >
                  <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Stock Status */}
              {product.stock <= product.low_stock_threshold && product.stock > 0 && (
                <p className="text-[#C99A45] text-xs uppercase tracking-widest font-bold">
                  Hurry, only {product.stock} units remaining
                </p>
              )}
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 text-[#06251B]">
                <ShieldCheck className="text-[#C99A45]" size={24} />
                <span className="text-xs uppercase tracking-widest font-semibold">100% Certified<br/>Authentic</span>
              </div>
              <div className="flex items-center gap-3 text-[#06251B]">
                <Truck className="text-[#C99A45]" size={24} />
                <span className="text-xs uppercase tracking-widest font-semibold">Insured Global<br/>Shipping</span>
              </div>
            </div>

            {/* Accordion/Tabs for Details */}
            <div className="border border-[#C99A45]/30 bg-white">
              <div className="flex border-b border-[#C99A45]/30">
                <button 
                  className={`flex-1 py-4 text-xs uppercase tracking-widest font-semibold ${activeTab === 'description' ? 'bg-[#0F3D2E] text-[#C99A45]' : 'text-[#8A6B4A] hover:bg-[#E8E1D5]'}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button 
                  className={`flex-1 py-4 text-xs uppercase tracking-widest font-semibold border-l border-[#C99A45]/30 ${activeTab === 'details' ? 'bg-[#0F3D2E] text-[#C99A45]' : 'text-[#8A6B4A] hover:bg-[#E8E1D5]'}`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
              </div>
              <div className="p-6">
                {activeTab === 'description' && (
                  <p className="text-[#1A1510] text-sm leading-relaxed">
                    {product.description || product.short_description}
                  </p>
                )}
                {activeTab === 'details' && (
                  <ul className="space-y-4 text-sm text-[#1A1510]">
                    <li className="flex justify-between border-b border-[#E8E1D5] pb-2">
                      <span className="text-[#8A6B4A] uppercase tracking-widest text-xs font-semibold">Material</span>
                      <span>{product.material || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between border-b border-[#E8E1D5] pb-2">
                      <span className="text-[#8A6B4A] uppercase tracking-widest text-xs font-semibold">Finish</span>
                      <span>{product.finish || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between border-b border-[#E8E1D5] pb-2">
                      <span className="text-[#8A6B4A] uppercase tracking-widest text-xs font-semibold">Weight</span>
                      <span>{product.weight || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between pb-2">
                      <span className="text-[#8A6B4A] uppercase tracking-widest text-xs font-semibold">Dimensions</span>
                      <span>{product.dimensions || 'N/A'}</span>
                    </li>
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
