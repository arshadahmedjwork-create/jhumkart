import { useState, useEffect } from 'react';
import { 
  Package, 
  Flame, 
  Settings,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function Dashboard() {
  const [_recentOrders, _setRecentOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [drops, setDrops] = useState<any[]>([]);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    activeDrops: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, productsRes, dropsRes, customersRes] = await Promise.all([
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('products').select('*').limit(3),
          supabase.from('drops').select('*').eq('is_active', true),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer')
        ]);

        if (ordersRes.data) {
          _setRecentOrders(ordersRes.data.slice(0, 5));
          const totalRevenue = ordersRes.data.reduce((sum, o) => sum + o.total, 0);
          setStats(prev => ({
            ...prev,
            revenue: totalRevenue,
            orders: ordersRes.data.length
          }));
        }

        if (productsRes.data) setProducts(productsRes.data);
        if (dropsRes.data) {
          setDrops(dropsRes.data);
          setStats(prev => ({ ...prev, activeDrops: dropsRes.data.length }));
        }
        if (typeof customersRes.count === 'number') {
          setStats(prev => ({ ...prev, customers: customersRes.count as number }));
        }

      } catch (error) {
        console.error("Dashboard data orchestrator failed", error);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-10">
      {/* Header Area */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-serif text-4xl text-[#06251B] mb-2 tracking-tight">Performance Shell</h1>
          <p className="text-[#8A6B4A] text-sm font-medium uppercase tracking-[0.2em]">Real-time metrics for JHUMKART global operations.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 bg-[#06251B] text-[#F7F1E6] text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-[#C99A45] hover:text-[#06251B] transition-all">
            Export Report
          </button>
          <button className="px-6 py-2.5 border border-[#E8E1D5] text-[#06251B] text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all">
            Configure
          </button>
        </div>
      </div>
      
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'Total Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, change: stats.orders > 0 ? `${stats.orders} orders` : '', color: 'border-black' },
          { name: 'Active Drops', value: stats.activeDrops, label: 'LIVE', color: 'border-[#C99A45]' },
          { name: 'Stock Status', value: '89%', label: 'REORDER 4', color: 'border-[#8A6B4A]' },
          { name: 'Loyalty Users', value: stats.customers, label: 'NEW 12', color: 'border-green-600' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-8 border-l-4 ${stat.color} shadow-sm group hover:shadow-md transition-shadow`}>
            <p className="text-[#8A6B4A] text-[10px] uppercase tracking-[0.2em] font-bold mb-4">{stat.name}</p>
            <div className="flex items-baseline gap-3">
              <h3 className="font-serif text-3xl text-[#06251B]">{stat.value}</h3>
              {stat.change && <span className="text-green-600 text-[10px] font-bold">{stat.change}</span>}
              {stat.label && <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                stat.label.includes('REORDER') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
              }`}>{stat.label}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart Section */}
        <div className="lg:col-span-2 bg-white border border-[#E8E1D5] p-10 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-serif text-2xl text-[#06251B]">Revenue Trajectory</h2>
            <div className="flex gap-4 text-[9px] font-bold uppercase tracking-widest text-[#8A6B4A]">
              <button className="border-b border-[#06251B] text-[#06251B] pb-1">Monthly</button>
              <button className="pb-1 hover:text-[#06251B]">Weekly</button>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-4">
            {[40, 65, 55, 80, 100, 75, 85].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4">
                <div 
                  className={`w-full transition-all duration-1000 ${i === 4 ? 'bg-[#06251B]' : 'bg-[#F7F1E6]'}`}
                  style={{ height: `${height}%` }}
                >
                  {i === 4 && <div className="text-[8px] text-[#06251B] font-bold -top-6 relative text-center w-full">PEAK</div>}
                </div>
                <span className="text-[10px] uppercase tracking-tighter text-[#8A6B4A] font-bold">
                  {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Drops Sidebar */}
        <div className="bg-[#06251B] p-10 shadow-xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C99A45]/5 -translate-y-1/2 translate-x-1/2 rotate-45"></div>
          <h2 className="font-serif text-2xl text-[#C99A45] mb-8 relative z-10">Priority Drops</h2>
          
          <div className="space-y-8 flex-1 relative z-10">
            {drops.length > 0 ? drops.map((drop, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 bg-white/10 p-2 overflow-hidden flex-shrink-0">
                  <Flame className="text-[#C99A45] opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-[#F7F1E6] text-xs font-bold uppercase truncate">{drop.title}</h4>
                  <p className="text-[#C99A45] text-[10px] uppercase tracking-widest mt-1">Live Sequence</p>
                </div>
                <ArrowUpRight size={16} className="text-green-400" />
              </div>
            )) : (
              <div className="text-[#F7F1E6]/40 text-xs italic">No active drop sequences...</div>
            )}

            <div className="flex items-center gap-4 group grayscale hover:grayscale-0 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-white/10 p-2 overflow-hidden flex-shrink-0">
                <Package className="text-white/30" />
              </div>
              <div className="flex-1">
                <h4 className="text-[#F7F1E6]/40 text-xs font-bold uppercase">Nebula Earrings</h4>
                <p className="text-red-400 text-[10px] uppercase tracking-widest mt-1">Sold Out</p>
              </div>
              <ArrowDownRight size={16} className="text-red-400" />
            </div>
          </div>

          <button className="mt-12 w-full py-4 border border-[#C99A45]/30 text-[#C99A45] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#C99A45] hover:text-[#06251B] transition-all relative z-10">
            View All Collections
          </button>
        </div>
      </div>

      {/* Stock Integrity Section */}
      <div className="bg-white border border-[#E8E1D5] p-10 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <h2 className="font-serif text-2xl text-[#06251B]">Stock Integrity</h2>
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A6B4A]" />
            <input type="text" placeholder="Search SKU..." className="w-full pl-10 pr-4 py-2 bg-[#FDFBF7] text-[10px] uppercase font-bold tracking-widest outline-none border border-transparent focus:border-[#E8E1D5]" />
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-[#8A6B4A] font-bold border-b border-[#E8E1D5]">
              <th className="pb-4">Artifact ID</th>
              <th className="pb-4">Product Name</th>
              <th className="pb-4">Material</th>
              <th className="pb-4">Quantity</th>
              <th className="pb-4">Status</th>
              <th className="pb-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-[11px] font-bold">
            {products.map((product, i) => (
              <tr key={i} className="border-b border-[#FDFBF7] group hover:bg-[#FDFBF7] transition-colors">
                <td className="py-6 text-[#8A6B4A] font-mono">{product.sku}</td>
                <td className="py-6 text-[#06251B] uppercase tracking-wide">{product.name}</td>
                <td className="py-6 text-[#8A6B4A]">{product.material || 'Heirloom Edition'}</td>
                <td className="py-6 text-[#06251B]">{product.stock.toString().padStart(2, '0')}</td>
                <td className="py-6">
                  <span className={`px-2 py-1 rounded-[2px] text-[8px] ${
                    product.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {product.stock <= 5 ? 'CRITICAL LOW' : 'HEALTHY'}
                  </span>
                </td>
                <td className="py-6 text-right">
                  <button className="text-[#8A6B4A] hover:text-[#06251B] transition-colors">
                    <Settings size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <button className="mt-8 w-full py-4 text-[10px] uppercase tracking-[0.3em] font-bold text-[#8A6B4A] hover:text-[#06251B] transition-colors">
          Load all {products.length}+ Artifacts
        </button>
      </div>
    </div>
  );
}

// Sub-components used
const Search = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);
