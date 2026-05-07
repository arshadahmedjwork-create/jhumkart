import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Calendar,
  Award,
  ChevronRight,
  FileText
} from 'lucide-react';
import { motion as _motion } from 'framer-motion';

export function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (c.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (c.phone || '').includes(searchQuery)
  );

  return (
    <div className="space-y-10">
      {/* Page Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 bg-[#06251B]"></div>
            <h1 className="font-serif text-3xl text-[#06251B]">Patron Registry</h1>
          </div>
          <p className="text-[#8A6B4A] text-sm uppercase tracking-widest font-medium">Manage and acknowledge your most dedicated collectors</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-[#E8E1D5] text-[#06251B] text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-sm">
            <FileText size={16} /> Export Patron List
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E8E1D5] p-8 shadow-sm">
          <p className="text-[#8A6B4A] text-[10px] uppercase tracking-[0.2em] font-bold mb-4">Total Patrons</p>
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-3xl text-[#06251B]">{customers.length}</h3>
            <Users className="text-[#06251B] opacity-10" size={32} />
          </div>
        </div>
        <div className="bg-white border border-[#E8E1D5] p-8 shadow-sm">
          <p className="text-[#8A6B4A] text-[10px] uppercase tracking-[0.2em] font-bold mb-4">Engagement Rate</p>
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-3xl text-[#06251B]">84.2%</h3>
            <Award className="text-[#C99A45] opacity-20" size={32} />
          </div>
        </div>
        <div className="bg-[#06251B] p-8 shadow-sm">
          <p className="text-[#C99A45] text-[10px] uppercase tracking-[0.2em] font-bold mb-4">VVIP Status</p>
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-3xl text-[#F7F1E6]">12</h3>
            <div className="w-8 h-8 rounded-full bg-[#C99A45] flex items-center justify-center text-[#06251B] font-bold text-xs">A+</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E8E1D5] p-4 flex gap-4 items-center shadow-sm">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A6B4A]" />
          <input 
            type="text" 
            placeholder="Search by Patron Name, Email or Contact..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-[#06251B] text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-[#06251B] text-xs font-bold uppercase tracking-widest hover:bg-[#FDFBF7]">
          <Filter size={16} /> Advanced Filter
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#E8E1D5] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-24 text-center text-[#8A6B4A] uppercase tracking-[0.2em] text-xs font-bold">Accessing Registry...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-24 text-center">
            <Users size={48} className="mx-auto mb-4 text-[#8A6B4A] opacity-20" />
            <p className="font-serif text-xl text-[#06251B]">No records match your search criteria.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E1D5] text-[10px] uppercase tracking-widest text-[#8A6B4A] font-bold">
                <th className="p-6">Patron Identity</th>
                <th className="p-6">Communication Channels</th>
                <th className="p-6">Registry Date</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-[#F7F1E6] hover:bg-[#FDFBF7] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#F7F1E6] border border-[#E8E1D5] flex items-center justify-center text-[#06251B] font-serif text-xl">
                        {(customer.full_name || 'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-[#06251B] uppercase tracking-wide">{customer.full_name || 'Anonymous Patron'}</div>
                        <div className="text-[10px] text-[#8A6B4A] font-mono mt-0.5 uppercase tracking-tighter">ID: {customer.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-[#06251B] font-medium">
                        <Mail size={12} className="text-[#8A6B4A]" />
                        {customer.email || 'No email provided'}
                      </div>
                      <div className="flex items-center gap-2 text-[#8A6B4A] text-xs">
                        <Phone size={12} className="text-[#8A6B4A]" />
                        {customer.phone || 'No contact number'}
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-[#06251B] font-medium">
                      <Calendar size={14} className="text-[#8A6B4A]" />
                      {new Date(customer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-[9px] font-bold uppercase tracking-widest">
                      Active Patron
                    </span>
                  </td>
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 text-center text-[10px] uppercase tracking-[0.3em] font-bold text-[#8A6B4A]">
        Showing {filteredCustomers.length} of {customers.length} Global Patrons
      </div>
    </div>
  );
}
