import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, ShieldCheck, Truck, Clock } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { mockProducts } from '@/data/products';
import { supabase } from '@/lib/supabase';
import heroImg from '@/assets/logo.png';
import meenakshiImg from '@/assets/meenakshi.png';
import bridalImg from '@/assets/bridal.png';
import pearlImg from '@/assets/pearl.png';

export function Home() {
  const { addItem } = useCart();
  const [activeDrop, setActiveDrop] = useState<any>(null);
  const [dropProducts, setDropProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDropData = async () => {
      try {
        const { data: drop } = await supabase
          .from('drops')
          .select('*')
          .eq('is_active', true)
          .order('start_time', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (drop) {
          setActiveDrop(drop);
          const { data: items } = await supabase
            .from('drop_items')
            .select('product:products(*, product_images(*))')
            .eq('drop_id', drop.id)
            .order('display_order');
          
          if (items) {
            setDropProducts(items.map((i: any) => i.product));
          }
        }
      } catch (error) {
        console.error("Home drop fetch failed", error);
      }
    };

    fetchDropData();
  }, []);

  const handleAddToCart = (productId: string) => {
    // Try to find in drop products first, then mock
    let product = dropProducts.find(p => p.id === productId);
    if (!product) {
      product = mockProducts.find(p => p.id === productId);
    }
    
    if (product) {
      addItem(product);
    }
  };
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen bg-[#06251B] flex items-center overflow-hidden pt-[72px] md:pt-[88px] mt-[-72px] md:mt-[-88px]">
        {/* Background Image positioned to the right */}
        <div className="absolute inset-0 w-full h-full flex justify-end pointer-events-none">
          <div className="w-full md:w-[60%] lg:w-[65%] h-full relative">
            <img 
              src={heroImg} 
              alt="Adornment Rooted in Culture" 
              className="w-full h-full object-cover object-center md:object-right"
            />
            {/* Gradient to blend image smoothly into the dark green background */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#06251B] via-[#06251B]/80 md:via-[#06251B]/40 to-transparent"></div>
          </div>
        </div>

        <div className="container relative mx-auto px-4 md:px-8 lg:px-12 z-10 py-12 md:py-0">
          <div className="max-w-2xl">
            {/* Title Decoration */}
            <div className="mb-8 flex items-center">
              <svg width="220" height="24" viewBox="0 0 220 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#C99A45]">
                <path d="M0 12H90" stroke="currentColor" strokeWidth="1"/>
                <path d="M220 12H130" stroke="currentColor" strokeWidth="1"/>
                <path d="M110 4L114 10H120L115 14L117 20L110 16L103 20L105 14L100 10H106L110 4Z" fill="currentColor"/>
                <circle cx="110" cy="12" r="2" fill="#06251B"/>
              </svg>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-serif text-[3.5rem] leading-[1.1] md:text-7xl lg:text-[5.5rem] text-[#C99A45] mb-6"
            >
              Adornment,<br/>Rooted in Culture.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-[#F7F1E6]/90 text-base md:text-lg lg:text-xl font-light mb-10 max-w-lg leading-relaxed"
            >
              Fine jewelry crafted with timeless Indian artistry, reimagined for the modern woman.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="mb-8 flex items-center"
            >
              <span className="text-[#C99A45] text-sm font-medium tracking-[0.2em] uppercase">Fine Jewelry | Culturally Rooted</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-5 mb-16"
            >
              <Link 
                to="/collections" 
                className="bg-[#DAB37B] text-[#06251B] px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#F7F1E6] transition-colors text-center flex items-center justify-center gap-3 w-fit"
              >
                Explore Collection <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
              <Link 
                to="/contact" 
                className="border border-[#C99A45]/60 text-[#C99A45] px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#C99A45] hover:text-[#06251B] transition-colors text-center flex items-center justify-center gap-3 w-fit"
              >
                Book A Styling Call <Calendar size={16} />
              </Link>
            </motion.div>

            {/* Inline Trust Strip matching the exact design */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-x-6 gap-y-4 text-[#C99A45] text-[10px] md:text-[11px] uppercase tracking-widest font-semibold"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} strokeWidth={1.5} />
                Hallmarked Gold
              </div>
              <div className="hidden md:block w-[1px] h-6 bg-[#C99A45]/30"></div>
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#C99A45]">
                  <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8L14 11H17L14.5 13L15.5 16L12 14L8.5 16L9.5 13L7 11H10L12 8Z" fill="currentColor"/>
                </svg>
                Handcrafted Details
              </div>
              <div className="hidden md:block w-[1px] h-6 bg-[#C99A45]/30"></div>
              <div className="flex items-center gap-2">
                <Truck size={18} strokeWidth={1.5} />
                Pan India Delivery
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="py-24 bg-[#F7F1E6]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h4 className="text-[#8A6B4A] uppercase tracking-widest text-sm mb-2 font-semibold">Curated Catalog</h4>
              <h2 className="font-serif text-4xl md:text-5xl text-[#06251B]">{activeDrop?.title || 'Active & Upcoming Drops'}</h2>
              {activeDrop && new Date(activeDrop.start_time) > new Date() && (
                <div className="mt-4 flex items-center gap-4 bg-[#06251B] text-[#C99A45] px-4 py-2 w-fit">
                  <Clock size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Unlocking in: 04 : 12 : 55</span>
                </div>
              )}
            </div>
            <Link to="/shop" className="hidden md:inline-block border-b border-[#06251B] text-[#06251B] pb-1 uppercase tracking-widest text-sm font-semibold hover:text-[#C99A45] hover:border-[#C99A45] transition-colors">
              View All Masterpieces
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {(dropProducts.length > 0 ? dropProducts : mockProducts).map((product, idx) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="relative aspect-[4/5] bg-[#E8E1D5] mb-6 overflow-hidden flex items-center justify-center p-8">
                  {product.stock <= 15 && (
                    <div className="absolute top-4 left-4 bg-[#C99A45] text-[#06251B] text-[10px] font-bold px-3 py-1 uppercase tracking-widest z-10 shadow-sm">
                      Only {product.stock} Left
                    </div>
                  )}
                  <img 
                    src={product.product_images?.[0]?.image_url || [meenakshiImg, bridalImg, pearlImg][idx % 3]} 
                    alt={product.name} 
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[#8A6B4A] text-xs uppercase tracking-widest mb-2 font-bold opacity-60">{product.material || 'Heirloom Edition'}</span>
                  <h3 className="font-serif text-2xl text-[#06251B] mb-2 leading-tight group-hover:text-[#C99A45] transition-colors">{product.name}</h3>
                  <p className="text-[#1A1510]/70 text-sm mb-6 line-clamp-2 leading-relaxed">{product.short_description}</p>
                  <div className="flex justify-between items-center w-full pt-4 border-t border-[#E8E1D5]">
                    <div className="flex flex-col">
                      {product.sale_price && (
                        <span className="text-xs text-[#8A6B4A] line-through decoration-[#C99A45]/40 opacity-60">₹{product.price.toLocaleString('en-IN')}</span>
                      )}
                      <span className="text-xl text-[#06251B] font-serif">₹{(product.sale_price || product.price).toLocaleString('en-IN')}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product.id);
                      }}
                      className="bg-[#06251B] text-[#F7F1E6] px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#C99A45] hover:text-[#06251B] transition-all shadow-md active:scale-95"
                    >
                      Deposit to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center md:hidden">
            <Link to="/shop" className="inline-block border-2 border-[#06251B] text-[#06251B] px-10 py-4 uppercase tracking-widest text-[10px] font-bold hover:bg-[#06251B] hover:text-[#F7F1E6] transition-all">
              View All Artifacts
            </Link>
          </div>
        </div>
      </section>

      {/* Heritage Story Section */}
      <section className="py-24 bg-[#0F3D2E] text-[#F7F1E6] relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10 flex flex-col items-center text-center max-w-4xl">
          <span className="text-[#C99A45] uppercase tracking-widest text-sm mb-6 font-semibold">Our Heritage</span>
          <h2 className="font-serif text-4xl md:text-6xl mb-8 leading-tight">Forged in <br/><span className="text-[#C99A45]">Silence & Light</span></h2>
          <p className="text-lg md:text-xl font-light text-[#F7F1E6]/80 mb-12">
            Each Jhumkart piece is an architectural artifact, meticulously engineered through cross-generational design and finished by generational master goldsmiths. Purest materials, sustainable methods.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full text-left border-t border-[#C99A45]/20 pt-12">
            <div>
              <h4 className="text-[#C99A45] font-bold tracking-widest uppercase mb-2">3X Precision</h4>
              <p className="text-sm text-[#F7F1E6]/70">Micro-level accuracy in every setting</p>
            </div>
            <div>
              <h4 className="text-[#C99A45] font-bold tracking-widest uppercase mb-2">Heirloom Quality</h4>
              <p className="text-sm text-[#F7F1E6]/70">Hand-selected flawless pearls and gems</p>
            </div>
          </div>
          <Link to="/about" className="mt-12 text-[#C99A45] border-b border-[#C99A45] pb-1 uppercase tracking-widest text-sm font-semibold hover:text-[#F7F1E6] transition-colors">
            The Philosophy of Form
          </Link>
        </div>
      </section>
    </div>
  );
}
