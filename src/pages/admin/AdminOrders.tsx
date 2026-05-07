import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  MoreHorizontal,
  CheckCircle2,
  Truck,
  XCircle,
  FileText
} from 'lucide-react';
import { motion as _motion } from 'framer-motion';

export function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(quantity, product:products(name, price))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'delivered': return 'bg-green-50 text-green-700 border-green-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Clock size={12} />;
      case 'shipped': return <Truck size={12} />;
      case 'delivered': return <CheckCircle2 size={12} />;
      case 'cancelled': return <XCircle size={12} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-10">
      {/* Page Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 bg-[#06251B]"></div>
            <h1 className="font-serif text-3xl text-[#06251B]">Logistics & Orders</h1>
          </div>
          <p className="text-[#8A6B4A] text-sm uppercase tracking-widest font-medium">Orchestrate fulfillment and tracking for the collection</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-[#E8E1D5] text-[#06251B] text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-sm">
            <FileText size={16} /> Fulfillment Log
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E8E1D5] p-4 mb-6 flex gap-4 items-center shadow-sm">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A6B4A]" />
          <input 
            type="text" 
            placeholder="Search by Order ID, Customer Name or Email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-[#06251B] text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-[#06251B] text-xs font-bold uppercase tracking-widest hover:bg-[#FDFBF7]">
          <Filter size={16} /> Advanced Filter
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E8E1D5] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-24 text-center text-[#8A6B4A] uppercase tracking-[0.2em] text-xs font-bold">Synchronizing Logistics...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-24 text-center">
            <ShoppingBag size={48} className="mx-auto mb-4 text-[#8A6B4A] opacity-20" />
            <p className="font-serif text-xl text-[#06251B]">No acquisitions found.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E1D5] text-[10px] uppercase tracking-widest text-[#8A6B4A] font-bold">
                <th className="p-6">Manifest ID</th>
                <th className="p-6">Client Identity</th>
                <th className="p-6">Sequence Status</th>
                <th className="p-6">Artifact Count</th>
                <th className="p-6">Transaction Value</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredOrders.map((order) => {
                const itemsCount = order.order_items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                
                return (
                  <tr key={order.id} className="border-b border-[#F7F1E6] hover:bg-[#FDFBF7] transition-colors group">
                    <td className="p-6">
                      <div className="font-mono text-[11px] text-[#06251B] font-bold">#{order.order_number}</div>
                      <div className="text-[10px] text-[#8A6B4A] mt-1 font-bold">{new Date(order.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="p-6">
                      <div className="font-bold text-[#06251B] uppercase tracking-wide">{order.customer_name}</div>
                      <div className="text-[10px] text-[#8A6B4A] font-medium truncate max-w-[150px]">{order.customer_email}</div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest ${getStatusStyle(order.order_status)}`}>
                          {getStatusIcon(order.order_status)}
                          {order.order_status}
                        </div>
                        <select 
                          value={order.order_status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-transparent text-[10px] uppercase font-bold text-[#8A6B4A] outline-none cursor-pointer hover:text-[#06251B]"
                        >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-6 text-[#06251B] font-medium">{itemsCount.toString().padStart(2, '0')} Masterpieces</td>
                    <td className="p-6 font-serif text-[#06251B] text-base">₹{order.total.toLocaleString('en-IN')}</td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white text-[#8A6B4A] hover:text-[#06251B] transition-colors shadow-sm border border-transparent hover:border-[#E8E1D5]">
                          <ChevronRight size={16} />
                        </button>
                        <button className="p-2 hover:bg-white text-[#8A6B4A] transition-colors">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 text-center text-[10px] uppercase tracking-[0.3em] font-bold text-[#8A6B4A]">
        Showing {filteredOrders.length} of {orders.length} Global Manifests
      </div>
    </div>
  );
}
