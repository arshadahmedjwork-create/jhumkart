import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/store/useCart';
import { useAuth } from '@/store/useAuth';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  // Enforce Login
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    }
  }, [user, navigate]);

  // Load existing profile/address data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      // Set email from auth
      setFormData(prev => ({ ...prev, email: user.email || '' }));

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        const names = (profile.full_name || '').split(' ');
        setFormData(prev => ({
          ...prev,
          firstName: names[0] || '',
          lastName: names.slice(1).join(' ') || '',
          phone: profile.phone || ''
        }));
      }

      // Fetch default address
      const { data: address } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .maybeSingle();

      if (address) {
        setFormData(prev => ({
          ...prev,
          address: address.address_line_1 || '',
          city: address.city || '',
          state: address.state || '',
          pincode: address.pincode || ''
        }));
      }
    };

    loadProfileData();
  }, [user]);

  // Load Razorpay script on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Check if Razorpay is loaded
  const isRazorpayLoaded = () => {
    return (window as any).Razorpay !== undefined;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!isRazorpayLoaded()) {
      alert("Payment gateway is still loading. Please wait a moment and try again.");
      return;
    }
    
    setIsProcessing(true);

    try {
      const subtotal = totalPrice();
      const shipping = subtotal > 50000 ? 0 : 500;
      const total = subtotal + shipping;

      // CRITICAL: Capture auth token BEFORE opening Razorpay modal.
      // The Supabase JS client hangs inside the Razorpay callback context.
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token || supabaseKey;

      // Snapshot items before Razorpay opens (closure safety)
      const snapshotItems = items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.sale_price || item.product.price,
        quantity: item.quantity,
        sku: item.product.sku
      }));
      const snapshotForm = { ...formData };
      const snapshotUserId = user?.id || null;

      const options = {
        key: 'rzp_test_SmZ3NQ3GQxS9aS',
        amount: Math.round(total * 100),
        currency: "INR",
        name: "Jhumkart",
        description: "Heritage Jewelry Acquisition",
        handler: function (response: any) {
          console.log("Razorpay success:", response.razorpay_payment_id);
          
          const orderId = crypto.randomUUID();
          const orderNumber = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
          const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

          const headers = {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${authToken}`,
            'Prefer': 'return=minimal'
          };

          console.log("Step 1: Creating order...");

          fetch(`${supabaseUrl}/rest/v1/orders`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              id: orderId,
              order_number: orderNumber,
              user_id: snapshotUserId,
              customer_name: `${snapshotForm.firstName} ${snapshotForm.lastName}`,
              customer_email: snapshotForm.email,
              customer_phone: snapshotForm.phone,
              shipping_address: snapshotForm,
              subtotal, shipping_fee: shipping, total,
              payment_status: 'paid',
              order_status: 'processing',
              razorpay_payment_id: response.razorpay_payment_id
            })
          })
          .then(res => {
            console.log("Order response:", res.status);
            if (!res.ok) return res.text().then(t => { throw new Error(`Order failed (${res.status}): ${t}`); });

            console.log("Step 2: Recording items...");
            return fetch(`${supabaseUrl}/rest/v1/order_items`, {
              method: 'POST',
              headers,
              body: JSON.stringify(snapshotItems.map(item => ({
                order_id: orderId,
                product_id: isUUID(item.id) ? item.id : null,
                product_name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
                sku: item.sku
              })))
            });
          })
          .then(res => {
            if (res && !res.ok) console.warn("Items insert status:", res.status);
            
            // Background profile sync (fire-and-forget)
            if (snapshotUserId) {
              fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${snapshotUserId}`, {
                method: 'PATCH', headers,
                body: JSON.stringify({
                  full_name: `${snapshotForm.firstName} ${snapshotForm.lastName}`,
                  phone: snapshotForm.phone
                })
              }).catch(() => {});
            }

            console.log("Step 3: Success! Redirecting...");
            clearCart();
            setIsProcessing(false);
            navigate('/order-success/' + orderId);
          })
          .catch(err => {
            console.error("Order error:", err);
            alert("Order Error: " + err.message);
            setIsProcessing(false);
          });
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        theme: { color: "#06251B" },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error("Payment failed", response.error);
        alert("Payment failed: " + response.error.description);
        setIsProcessing(false);
      });
      rzp.open();
      
    } catch (error) {
      console.error("Checkout initialization failed", error);
      setIsProcessing(false);
      alert("Failed to initialize payment gateway.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#F7F1E6] min-h-screen py-24 flex flex-col items-center">
        <h2 className="font-serif text-3xl text-[#06251B] mb-6">Your Cart is Empty</h2>
        <button onClick={() => navigate('/shop')} className="bg-[#0F3D2E] text-[#F7F1E6] px-8 py-3 uppercase tracking-widest text-sm hover:bg-[#C99A45] hover:text-[#06251B] transition-colors">
          Return to Shop
        </button>
      </div>
    );
  }

  const subtotal = totalPrice();
  const shipping = subtotal > 50000 ? 0 : 500; // Free shipping over 50k
  const total = subtotal + shipping;

  return (
    <div className="bg-[#F7F1E6] min-h-screen">
      <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-12">
        
        {/* Left Col - Form */}
        <div className="flex-1">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#8A6B4A] hover:text-[#06251B] transition-colors mb-8 text-sm uppercase tracking-widest font-semibold">
            <ArrowLeft size={16} /> Return to Cart
          </button>
          
          <h1 className="font-serif text-3xl text-[#06251B] mb-8">Secure Checkout</h1>

          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">
            {/* Contact Info */}
            <div className="bg-white p-6 md:p-8 border border-[#C99A45]/30">
              <h2 className="font-serif text-xl text-[#06251B] mb-4 border-b border-[#E8E1D5] pb-2">Contact Information</h2>
              <div className="space-y-4 mt-6">
                <div>
                  <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-1">Email Address</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#F7F1E6] border border-[#C99A45]/30 px-4 py-3 focus:outline-none focus:border-[#C99A45] text-[#1A1510]" />
                </div>
                <div>
                  <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-1">Phone Number</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#F7F1E6] border border-[#C99A45]/30 px-4 py-3 focus:outline-none focus:border-[#C99A45] text-[#1A1510]" />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 md:p-8 border border-[#C99A45]/30">
              <h2 className="font-serif text-xl text-[#06251B] mb-4 border-b border-[#E8E1D5] pb-2">Shipping Address</h2>
              <div className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-1">First Name</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-[#F7F1E6] border border-[#C99A45]/30 px-4 py-3 focus:outline-none focus:border-[#C99A45] text-[#1A1510]" />
                  </div>
                  <div>
                    <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-1">Last Name</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-[#F7F1E6] border border-[#C99A45]/30 px-4 py-3 focus:outline-none focus:border-[#C99A45] text-[#1A1510]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-1">Address</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-[#F7F1E6] border border-[#C99A45]/30 px-4 py-3 focus:outline-none focus:border-[#C99A45] text-[#1A1510]" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 md:col-span-1">
                    <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-1">City</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-[#F7F1E6] border border-[#C99A45]/30 px-4 py-3 focus:outline-none focus:border-[#C99A45] text-[#1A1510]" />
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-1">State</label>
                    <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full bg-[#F7F1E6] border border-[#C99A45]/30 px-4 py-3 focus:outline-none focus:border-[#C99A45] text-[#1A1510]" />
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-1">Pincode</label>
                    <input required type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full bg-[#F7F1E6] border border-[#C99A45]/30 px-4 py-3 focus:outline-none focus:border-[#C99A45] text-[#1A1510]" />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Right Col - Order Summary */}
        <div className="w-full lg:w-[450px]">
          <div className="bg-white p-6 md:p-8 border border-[#C99A45]/30 sticky top-24">
            <h2 className="font-serif text-xl text-[#06251B] mb-6 border-b border-[#E8E1D5] pb-2">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {items.map(item => {
                const product = item.product;
                if (!product) return null; // Guard against missing product data

                const price = product.sale_price || product.price;
                const image = product.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1599643478524-fb66f7f2b1d6?q=80&w=600&auto=format&fit=crop';
                return (
                  <div key={product.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-[#F7F1E6] border border-[#E8E1D5] flex-shrink-0 relative">
                      <img src={image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                      <span className="absolute -top-2 -right-2 bg-[#8A6B4A] text-[#F7F1E6] text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[#06251B] font-serif text-sm line-clamp-1">{product.name}</p>
                      <p className="text-[#8A6B4A] text-xs">₹{price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#E8E1D5] pt-4 space-y-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-[#8A6B4A]">Subtotal</span>
                <span className="text-[#06251B]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A6B4A]">Shipping</span>
                <span className="text-[#06251B]">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
            </div>

            <div className="border-t border-[#06251B] pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="uppercase tracking-widest font-bold text-[#06251B]">Total</span>
                <span className="font-serif text-2xl text-[#06251B]">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[#8A6B4A] text-xs text-right mt-1">Includes GST</p>
            </div>

            <button 
              form="checkout-form"
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[#0F3D2E] text-[#F7F1E6] py-4 uppercase tracking-widest text-sm font-semibold hover:bg-[#C99A45] hover:text-[#06251B] transition-colors disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
            >
              {isProcessing ? 'Processing Payment...' : 'Pay via Razorpay'}
            </button>

            <div className="flex items-center justify-center gap-2 mt-6 text-[#8A6B4A]">
              <ShieldCheck size={16} />
              <span className="text-xs uppercase tracking-widest">100% Secure Encrypted Payment</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
