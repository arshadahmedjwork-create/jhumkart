import { Link } from 'react-router-dom';
import logoUrl from '@/assets/logo_web.png';

export function Footer() {
  return (
    <footer className="bg-[#06251B] text-[#F7F1E6] pt-16 pb-8 border-t border-[#C99A45]/20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1 flex flex-col items-start">
            <img src={logoUrl} alt="Jhumkart" className="h-12 object-contain mb-6" />
            <p className="text-[#8A6B4A] text-sm leading-relaxed mb-6">
              Adornment, Rooted in Culture. Fine jewelry crafted with timeless Indian artistry, reimagined for the modern woman.
            </p>
            <div className="flex items-center space-x-4 text-[#C99A45]">
              {/* Social Icons Placeholders */}
              <a href="#" className="w-10 h-10 rounded-full border border-[#C99A45]/30 flex items-center justify-center hover:bg-[#C99A45] hover:text-[#06251B] transition-colors">IN</a>
              <a href="#" className="w-10 h-10 rounded-full border border-[#C99A45]/30 flex items-center justify-center hover:bg-[#C99A45] hover:text-[#06251B] transition-colors">FB</a>
              <a href="#" className="w-10 h-10 rounded-full border border-[#C99A45]/30 flex items-center justify-center hover:bg-[#C99A45] hover:text-[#06251B] transition-colors">PT</a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-serif text-lg text-[#C99A45] mb-6 tracking-wide">Shop</h4>
            <ul className="space-y-4">
              <li><Link to="/collections#antique" className="text-sm hover:text-[#C99A45] transition-colors">Antique Jhumkas</Link></li>
              <li><Link to="/collections#temple" className="text-sm hover:text-[#C99A45] transition-colors">Temple Jhumkas</Link></li>
              <li><Link to="/collections#bridal" className="text-sm hover:text-[#C99A45] transition-colors">Bridal Collection</Link></li>
              <li><Link to="/shop?filter=new" className="text-sm hover:text-[#C99A45] transition-colors">New Arrivals</Link></li>
              <li><Link to="/shop?filter=bestsellers" className="text-sm hover:text-[#C99A45] transition-colors">Bestsellers</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-serif text-lg text-[#C99A45] mb-6 tracking-wide">About</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-sm hover:text-[#C99A45] transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-[#C99A45] transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping-policy" className="text-sm hover:text-[#C99A45] transition-colors">Shipping Policy</Link></li>
              <li><Link to="/return-policy" className="text-sm hover:text-[#C99A45] transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/privacy-policy" className="text-sm hover:text-[#C99A45] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/admin" className="text-sm hover:text-[#C99A45] transition-colors flex items-center gap-2 mt-4 text-[#8A6B4A]">Admin Portal <span className="bg-[#C99A45] text-[#06251B] text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Staff</span></Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif text-lg text-[#C99A45] mb-6 tracking-wide">Enter The Registry</h4>
            <p className="text-[#8A6B4A] text-sm mb-6">
              Receive notifications for archival drops and private artisan sessions before public release.
            </p>
            <form className="flex flex-col space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="YOUR EMAIL ADDRESS" 
                className="bg-transparent border-b border-[#8A6B4A] py-2 text-sm text-[#F7F1E6] focus:outline-none focus:border-[#C99A45] transition-colors"
                required
              />
              <button 
                type="submit" 
                className="bg-[#0F3D2E] text-[#C99A45] border border-[#0F3D2E] hover:border-[#C99A45] py-3 text-xs uppercase tracking-widest font-semibold transition-colors mt-2"
              >
                Join Now
              </button>
            </form>
          </div>

        </div>

        <div className="pt-8 border-t border-[#8A6B4A]/20 flex flex-col md:flex-row justify-between items-center text-xs text-[#8A6B4A]">
          <p>&copy; {new Date().getFullYear()} Jhumkart. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span>Hallmarked Gold</span>
            <span>•</span>
            <span>Handcrafted</span>
            <span>•</span>
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
