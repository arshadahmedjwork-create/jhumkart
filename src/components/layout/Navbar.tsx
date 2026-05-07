import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import logoUrl from '@/assets/logo_web.png';

import { SearchOverlay } from './SearchOverlay';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const cartItemsCount = useCart(state => state.totalItems());
  const wishlistItemsCount = useWishlist(state => state.items.length);
  const setCartOpen = useCart(state => state.setIsOpen);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Collections', path: '/collections' },
    { name: 'Bridal', path: '/collections#bridal' },
    { name: 'Heritage', path: '/collections#heritage' },
    { name: 'New Arrivals', path: '/shop?filter=new' },
    { name: 'About', path: '/about' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-[#06251B] shadow-md py-3' : 'bg-[#0F3D2E] py-5'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-[#C99A45]"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img 
              src={logoUrl} 
              alt="Jhumkart Logo" 
              className="h-10 md:h-12 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className="text-[#F7F1E6] text-sm uppercase tracking-widest hover:text-[#C99A45] transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C99A45] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4 md:space-x-6 text-[#C99A45]">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hover:text-[#F7F1E6] transition-colors hidden sm:block"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Link to="/account" className="hover:text-[#F7F1E6] transition-colors hidden sm:block">
              <User size={20} strokeWidth={1.5} />
            </Link>
            <Link to="/wishlist" className="hover:text-[#F7F1E6] transition-colors relative">
              <Heart size={20} strokeWidth={1.5} />
              {wishlistItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#C99A45] text-[#06251B] text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {wishlistItemsCount}
                </span>
              )}
            </Link>
            <button 
              onClick={() => setCartOpen(true)}
              className="hover:text-[#F7F1E6] transition-colors relative"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#C99A45] text-[#06251B] text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
            <Link to="/shop" className="hidden lg:block border border-[#C99A45] text-[#C99A45] px-6 py-2 text-xs uppercase tracking-widest hover:bg-[#C99A45] hover:text-[#06251B] transition-all">
              Shop Now
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-[#06251B] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-[#1A1510]/20">
              <img src={logoUrl} alt="Jhumkart Logo" className="h-8 object-contain" />
              <button 
                className="text-[#C99A45]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={28} />
              </button>
            </div>
            
            <nav className="flex flex-col py-8 px-6 space-y-6 flex-grow">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className="text-[#F7F1E6] text-xl uppercase tracking-widest font-serif"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="p-6 border-t border-[#1A1510]/20 bg-[#0F3D2E]">
              <div className="flex items-center justify-around text-[#C99A45]">
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); setIsSearchOpen(true); }}
                  className="flex flex-col items-center gap-2"
                >
                  <Search size={24} strokeWidth={1.5} />
                  <span className="text-xs uppercase tracking-widest">Search</span>
                </button>
                <Link to="/account" className="flex flex-col items-center gap-2">
                  <User size={24} strokeWidth={1.5} />
                  <span className="text-xs uppercase tracking-widest">Account</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
