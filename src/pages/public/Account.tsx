import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';
import { Package, User, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function Account() {
  const { user, profile, signOut, initialize } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Form State
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState({
    line1: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    if (user) {
      const fetchAddress = async () => {
        const { data } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .maybeSingle();
        
        if (data) {
          setAddress({
            line1: data.address_line_1 || '',
            city: data.city || '',
            state: data.state || '',
            pincode: data.pincode || ''
          });
        }
      };
      fetchAddress();
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'orders') {
      const fetchOrders = async () => {
        const { data } = await supabase
          .from('orders')
          .select('*, order_items(*, product:products(*, product_images(*)))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (data) setOrders(data);
      };
      fetchOrders();
    }
  }, [user, activeTab]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // 1. Update Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName, 
          phone: phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;

      // 2. Update Address
      const { data: existingAddress } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .maybeSingle();

      const addressPayload = {
        user_id: user.id,
        full_name: fullName,
        phone: phone,
        address_line_1: address.line1,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        is_default: true,
        type: 'shipping'
      };

      if (existingAddress) {
        await supabase.from('addresses').update(addressPayload).eq('id', existingAddress.id);
      } else {
        await supabase.from('addresses').insert(addressPayload);
      }
      
      alert("Account details updated successfully!");
      
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (newProfile) {
        useAuth.setState({ profile: newProfile });
      }
      
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-[#F7F1E6] min-h-screen py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <h1 className="font-serif text-3xl text-[#06251B] mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-semibold text-sm uppercase tracking-widest border-l-4 transition-colors ${
                activeTab === 'profile' ? 'bg-[#E8E1D5] text-[#06251B] border-[#C99A45]' : 'text-[#8A6B4A] border-transparent hover:bg-[#E8E1D5] hover:text-[#06251B]'
              }`}
            >
              <User size={18} />
              Profile
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-semibold text-sm uppercase tracking-widest border-l-4 transition-colors ${
                activeTab === 'orders' ? 'bg-[#E8E1D5] text-[#06251B] border-[#C99A45]' : 'text-[#8A6B4A] border-transparent hover:bg-[#E8E1D5] hover:text-[#06251B]'
              }`}
            >
              <Package size={18} />
              Orders
            </button>
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 mt-8 hover:bg-red-50 text-red-500 transition-colors text-sm uppercase tracking-widest border-l-4 border-transparent"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>

          {/* Main Content */}
          <div className="col-span-1 md:col-span-3 bg-white p-8 border border-[#C99A45]/30 min-h-[400px]">
            {activeTab === 'profile' && (
              <>
                <h2 className="font-serif text-2xl text-[#06251B] mb-6">Profile Details</h2>
                
                <div className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-1">Email Address</label>
                    <div className="bg-[#F7F1E6] px-4 py-3 border border-[#C99A45]/20 text-[#1A1510] opacity-70">
                      {user.email}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#F7F1E6] border border-[#C99A45]/30 px-4 py-3 focus:outline-none focus:border-[#C99A45] text-[#1A1510]" 
                      placeholder="Your Name"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#F7F1E6] border border-[#C99A45]/30 px-4 py-3 focus:outline-none focus:border-[#C99A45] text-[#1A1510]" 
                      placeholder="+91"
                    />
                  </div>

                  <div className="pt-4 border-t border-[#E8E1D5]">
                    <h3 className="font-serif text-lg text-[#06251B] mb-4">Default Shipping Address</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-1">Street Address</label>
                        <input 
                          type="text" 
                          value={address.line1}
                          onChange={(e) => setAddress(prev => ({ ...prev, line1: e.target.value }))}
                          className="w-full bg-[#F7F1E6] border border-[#C99A45]/30 px-4 py-3 focus:outline-none focus:border-[#C99A45] text-[#1A1510]" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-1">City</label>
                          <input 
                            type="text" 
                            value={address.city}
                            onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full bg-[#F7F1E6] border border-[#C99A45]/30 px-4 py-3 focus:outline-none focus:border-[#C99A45] text-[#1A1510]" 
                          />
                        </div>
                        <div>
                          <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-1">State</label>
                          <input 
                            type="text" 
                            value={address.state}
                            onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
                            className="w-full bg-[#F7F1E6] border border-[#C99A45]/30 px-4 py-3 focus:outline-none focus:border-[#C99A45] text-[#1A1510]" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-1">Pincode</label>
                        <input 
                          type="text" 
                          value={address.pincode}
                          onChange={(e) => setAddress(prev => ({ ...prev, pincode: e.target.value }))}
                          className="w-full bg-[#F7F1E6] border border-[#C99A45]/30 px-4 py-3 focus:outline-none focus:border-[#C99A45] text-[#1A1510]" 
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-[#0F3D2E] text-[#C99A45] px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#C99A45] hover:text-[#06251B] transition-colors mt-4 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}

            {activeTab === 'orders' && (
              <>
                <h2 className="font-serif text-2xl text-[#06251B] mb-6">Order History</h2>
                
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-[#8A6B4A]">
                    <Package size={48} className="mx-auto mb-4 opacity-50" strokeWidth={1} />
                    <p className="mb-6 font-serif text-lg">You haven't placed any orders yet.</p>
                    <a href="/shop" className="inline-block border border-[#06251B] text-[#06251B] px-8 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#06251B] hover:text-[#F7F1E6] transition-colors">
                      Start Shopping
                    </a>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-[#C99A45]/20 p-6">
                        <div className="flex justify-between items-start mb-4 border-b border-[#E8E1D5] pb-4">
                          <div>
                            <p className="text-[#8A6B4A] text-xs uppercase tracking-widest mb-1">Order {order.order_number}</p>
                            <p className="text-[#06251B] font-semibold">₹{order.total.toLocaleString('en-IN')}</p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <div>
                              <p className="text-[#8A6B4A] text-xs mb-1">{new Date(order.created_at).toLocaleDateString()}</p>
                              <span className="inline-block bg-[#E8E1D5] text-[#06251B] text-xs px-2 py-1 uppercase tracking-widest font-bold">
                                {order.order_status}
                              </span>
                            </div>
                            <Link 
                              to={`/track-order/${order.id}`}
                              className="text-xs uppercase tracking-widest font-semibold text-[#8A6B4A] hover:text-[#06251B] border-b border-transparent hover:border-[#06251B] transition-all"
                            >
                              Track Order
                            </Link>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {order.order_items?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-[#F7F1E6] flex-shrink-0">
                                <img 
                                  src={item.product?.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1599643478524-fb66f7f2b1d6?q=80&w=600&auto=format&fit=crop'} 
                                  alt={item.product_name || 'Jewelry'} 
                                  className="w-full h-full object-cover mix-blend-multiply" 
                                />
                              </div>
                              <div>
                                <p className="font-serif text-[#06251B] text-sm">{item.product_name}</p>
                                <p className="text-[#8A6B4A] text-xs">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
