import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  LogOut, 
  Flame, 
  Layers, 
  Search, 
  Bell, 
  Settings,
  HelpCircle,
  ExternalLink,
  X,
  Check
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function AdminLayout() {
  const { signOut, user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Admin';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Product Catalog', path: '/admin/products', icon: Package },
    { name: 'Drop Management', path: '/admin/drops', icon: Flame },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Clientele', path: '/admin/customers', icon: Users },
  ];

  const notifications = [
    { id: 1, text: 'New order received — ORD-AX7K2P', time: '2 min ago', read: false },
    { id: 2, text: 'Low stock alert: Antique Gold Bridal Jhumka', time: '1 hr ago', read: false },
    { id: 3, text: 'Customer registered — Abinav Sathish', time: '3 hrs ago', read: true },
  ];

  return (
    <div className="flex h-screen bg-[#FDFBF7]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#F7F1E6]/30 flex flex-col h-full border-r border-[#E8E1D5]">
        <div className="p-8">
          <h1 className="font-serif text-2xl text-[#06251B] tracking-tight uppercase">Heritage Admin</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8A6B4A] mt-1 font-bold">Luxury Management</p>
        </div>

        <nav className="flex-1 px-6 space-y-1 mt-4">
          <div className="text-[10px] uppercase tracking-widest text-[#8A6B4A] mb-4 font-bold opacity-50 px-4">Management</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 transition-all text-sm ${
                  isActive 
                    ? 'bg-white text-[#06251B] font-bold shadow-sm border-r-4 border-[#06251B]' 
                    : 'text-[#06251B]/60 hover:text-[#06251B] hover:bg-white/50'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={isActive ? 'tracking-normal' : 'tracking-wide font-medium'}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 space-y-4">
          <div className="px-4 space-y-3">
            <Link to="/" className="flex items-center gap-3 text-xs text-[#8A6B4A] hover:text-[#06251B] transition-colors">
              <HelpCircle size={14} /> Support
            </Link>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 text-xs text-[#8A6B4A] hover:text-red-600 transition-colors w-full"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
          
          <div className="bg-[#06251B] p-4 rounded-lg flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#C99A45] flex items-center justify-center text-[#06251B] font-serif text-sm font-bold">
              {initials}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[#F7F1E6] text-[10px] font-bold uppercase truncate">{displayName}</p>
              <p className="text-[#C99A45] text-[9px] uppercase tracking-widest truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Header */}
        <header className="h-20 border-b border-[#E8E1D5] flex items-center justify-between px-10 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <Search size={18} className="text-[#8A6B4A]" />
            <input 
              type="text" 
              placeholder="Search Masterpieces, Orders, Clientele..." 
              className="bg-transparent border-none outline-none text-sm w-full text-[#1A1510] placeholder:text-[#8A6B4A]/50"
            />
          </div>

          <div className="flex items-center gap-6">
            <Link to="/" target="_blank" className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] hover:text-[#06251B] transition-colors">
              View Store <ExternalLink size={12} />
            </Link>
            <div className="w-[1px] h-6 bg-[#E8E1D5]"></div>
            
            {/* Notifications Button */}
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); }}
              className="text-[#8A6B4A] hover:text-[#06251B] transition-colors relative"
            >
              <Bell size={20} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[8px] text-white font-bold flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            {/* Settings Button */}
            <button 
              onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); }}
              className="text-[#8A6B4A] hover:text-[#06251B] transition-colors"
            >
              <Settings size={20} />
            </button>
            
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E8E1D5]">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=06251B&color=C99A45`} alt="Admin" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Notification / Settings Panels */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-24 top-16 w-96 bg-white border border-[#E8E1D5] shadow-2xl z-50"
            >
              <div className="p-5 border-b border-[#E8E1D5] flex justify-between items-center">
                <h3 className="font-serif text-lg text-[#06251B]">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="text-[#8A6B4A] hover:text-[#06251B]"><X size={16} /></button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`p-4 border-b border-[#F7F1E6] hover:bg-[#FDFBF7] transition-colors flex gap-3 ${!n.read ? 'bg-orange-50/30' : ''}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-orange-500' : 'bg-transparent'}`}></div>
                    <div>
                      <p className="text-xs text-[#06251B] font-medium">{n.text}</p>
                      <p className="text-[10px] text-[#8A6B4A] mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center">
                <button className="text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] hover:text-[#06251B]">Mark All as Read</button>
              </div>
            </motion.div>
          )}

          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-10 top-16 w-80 bg-white border border-[#E8E1D5] shadow-2xl z-50"
            >
              <div className="p-5 border-b border-[#E8E1D5] flex justify-between items-center">
                <h3 className="font-serif text-lg text-[#06251B]">Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-[#8A6B4A] hover:text-[#06251B]"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-[#06251B] font-medium">Dark Mode</span>
                  <div className="w-10 h-5 bg-[#E8E1D5] rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-[#06251B] font-medium">Email Notifications</span>
                  <div className="w-10 h-5 bg-[#06251B] rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-[#C99A45] rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-[#06251B] font-medium">Low Stock Alerts</span>
                  <div className="w-10 h-5 bg-[#06251B] rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-[#C99A45] rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#E8E1D5]">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-2">Account</p>
                  <p className="text-xs text-[#06251B]">{user?.email}</p>
                  <p className="text-[10px] text-[#8A6B4A] mt-1">Role: {profile?.role || 'admin'}</p>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="w-full py-3 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto p-10 bg-[#FDFBF7] relative" onClick={() => { setShowNotifications(false); setShowSettings(false); }}>
          <Outlet />
          
          <footer className="mt-12 pt-8 border-t border-[#E8E1D5] flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-[#8A6B4A]">
            <p>© 2024 Jhumkart Heritage Administration</p>
            <p className="italic font-serif normal-case tracking-normal text-sm text-[#06251B]">Where antiquity meets the future.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
