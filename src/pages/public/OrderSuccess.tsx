import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Printer, MapPin, ShoppingBag, Package, ArrowRight, Shield, Truck, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      // Use raw fetch with the anon key for reliability
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token || supabaseKey;

      try {
        // Fetch order
        const orderRes = await fetch(
          `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&select=*`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        const orders = await orderRes.json();
        
        if (orders && orders.length > 0) {
          const orderData = orders[0];
          
          // Fetch order items
          const itemsRes = await fetch(
            `${supabaseUrl}/rest/v1/order_items?order_id=eq.${orderId}&select=*`,
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${authToken}`
              }
            }
          );
          const items = await itemsRes.json();
          orderData.order_items = Array.isArray(items) ? items : [];
          
          setOrder(orderData);
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handlePrintInvoice = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shippingAddress = order?.shipping_address;

  return (
    <div className="bg-[#F7F1E6] min-h-screen print:bg-white">
      {/* Screen View */}
      <div className="print:hidden">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          
          {/* Success Animation */}
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="text-center mb-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#06251B] flex items-center justify-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <CheckCircle2 className="w-12 h-12 text-[#C99A45]" strokeWidth={1.5} />
              </motion.div>
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="font-serif text-4xl text-[#06251B] mb-3"
            >
              Acquisition Confirmed
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-[#8A6B4A] text-sm uppercase tracking-[0.3em]"
            >
              Your heritage masterpiece is being prepared with care
            </motion.p>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-white border border-[#E8E1D5] overflow-hidden mb-8"
          >
            {/* Header */}
            <div className="bg-[#06251B] px-8 py-6 flex justify-between items-center">
              <div>
                <p className="text-[#C99A45] text-[10px] uppercase tracking-[0.3em] font-bold mb-1">Order Confirmation</p>
                <h2 className="text-[#F7F1E6] font-serif text-2xl">{order?.order_number || '—'}</h2>
              </div>
              <div className="text-right">
                <p className="text-[#C99A45] text-[10px] uppercase tracking-[0.3em] font-bold mb-1">Date</p>
                <p className="text-[#F7F1E6] font-serif">
                  {order?.created_at ? formatDate(order.created_at) : '—'}
                </p>
              </div>
            </div>

            {/* Status Ribbon */}
            <div className="grid grid-cols-3 border-b border-[#E8E1D5]">
              <div className="p-5 flex items-center gap-3 border-r border-[#E8E1D5]">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <Shield size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] text-[#8A6B4A] uppercase tracking-widest font-bold">Payment</p>
                  <p className="text-sm text-green-700 font-semibold">Confirmed</p>
                </div>
              </div>
              <div className="p-5 flex items-center gap-3 border-r border-[#E8E1D5]">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <Package size={18} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] text-[#8A6B4A] uppercase tracking-widest font-bold">Status</p>
                  <p className="text-sm text-orange-700 font-semibold">Processing</p>
                </div>
              </div>
              <div className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Truck size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] text-[#8A6B4A] uppercase tracking-widest font-bold">Delivery</p>
                  <p className="text-sm text-blue-700 font-semibold">5-7 Days</p>
                </div>
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-[#E8E1D5] rounded w-48 mx-auto mb-4"></div>
                  <div className="h-3 bg-[#E8E1D5] rounded w-32 mx-auto"></div>
                </div>
                <p className="text-[#8A6B4A] text-sm mt-4">Retrieving order details...</p>
              </div>
            ) : order ? (
              <div className="p-8">
                {/* Items */}
                <div className="mb-8">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#8A6B4A] mb-4">Acquired Masterpieces</h3>
                  <div className="space-y-4">
                    {order.order_items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between py-4 border-b border-[#F7F1E6] last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-[#F7F1E6] flex items-center justify-center flex-shrink-0">
                            <ShoppingBag size={20} className="text-[#8A6B4A]" />
                          </div>
                          <div>
                            <p className="font-serif text-[#06251B]">{item.product_name || 'Heritage Masterpiece'}</p>
                            <p className="text-[#8A6B4A] text-xs mt-1">
                              {item.sku ? `SKU: ${item.sku} · ` : ''}Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-serif text-[#06251B] text-lg">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-[#FDFBF7] p-6 border border-[#E8E1D5]">
                  <div className="flex justify-between items-center text-sm text-[#8A6B4A] mb-3">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal || order.total)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-[#8A6B4A] mb-3">
                    <span>Shipping</span>
                    <span>{order.shipping_fee === 0 ? 'Complimentary' : formatCurrency(order.shipping_fee)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-700 mb-3">
                      <span>Discount</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-[#E8E1D5]">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#06251B]">Total Paid</span>
                    <span className="font-serif text-2xl text-[#06251B]">{formatCurrency(order.total)}</span>
                  </div>
                  <p className="text-[10px] text-[#8A6B4A] text-right mt-1">Inclusive of all taxes</p>
                </div>

                {/* Shipping Info */}
                {shippingAddress && (
                  <div className="mt-8 grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#8A6B4A] mb-3">Shipping To</h3>
                      <p className="text-sm text-[#06251B] font-semibold">
                        {shippingAddress.firstName} {shippingAddress.lastName}
                      </p>
                      <p className="text-sm text-[#8A6B4A] mt-1">{shippingAddress.address}</p>
                      <p className="text-sm text-[#8A6B4A]">
                        {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#8A6B4A] mb-3">Contact</h3>
                      <p className="text-sm text-[#06251B]">{shippingAddress.email}</p>
                      <p className="text-sm text-[#8A6B4A] mt-1">{shippingAddress.phone}</p>
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                {order.razorpay_payment_id && (
                  <div className="mt-8 pt-6 border-t border-[#E8E1D5]">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#8A6B4A] mb-3">Payment Reference</h3>
                    <p className="text-sm text-[#06251B] font-mono">{order.razorpay_payment_id}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Clock size={32} className="mx-auto mb-4 text-[#8A6B4A] opacity-50" />
                <p className="text-[#8A6B4A] text-sm">Order details are being synchronized. Please refresh in a moment.</p>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <Link
              to={`/track-order/${orderId}`}
              className="flex items-center justify-center gap-3 bg-[#06251B] text-[#C99A45] px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#C99A45] hover:text-[#06251B] transition-all"
            >
              <MapPin size={16} /> Track Order
            </Link>
            <button
              onClick={handlePrintInvoice}
              className="flex items-center justify-center gap-3 border-2 border-[#06251B] text-[#06251B] px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#06251B] hover:text-[#F7F1E6] transition-all"
            >
              <Printer size={16} /> Download Invoice
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-center"
          >
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-[#8A6B4A] text-xs font-bold uppercase tracking-[0.2em] hover:text-[#06251B] transition-colors"
            >
              Continue Exploring <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Print-Only Invoice View */}
      <div className="hidden print:block" ref={invoiceRef}>
        <div className="max-w-3xl mx-auto p-8">
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold tracking-wide">JHUMKART</h1>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Heritage Jewelry Atelier</p>
              <p className="text-xs text-gray-500 mt-3">GSTIN: 33AABCJ1234F1Z5</p>
              <p className="text-xs text-gray-500">Chennai, Tamil Nadu, India</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold uppercase tracking-widest">Tax Invoice</h2>
              <p className="text-sm text-gray-600 mt-2">
                Invoice: {order?.order_number || '—'}
              </p>
              <p className="text-sm text-gray-600">
                Date: {order?.created_at ? formatDate(order.created_at) : '—'}
              </p>
              <p className="text-sm text-gray-600">
                Time: {order?.created_at ? formatTime(order.created_at) : '—'}
              </p>
            </div>
          </div>

          {/* Billing Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">Bill To</h3>
              <p className="font-semibold">{order?.customer_name || '—'}</p>
              {shippingAddress && (
                <>
                  <p className="text-sm text-gray-600">{shippingAddress.address}</p>
                  <p className="text-sm text-gray-600">{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                </>
              )}
              <p className="text-sm text-gray-600 mt-1">{order?.customer_email}</p>
              <p className="text-sm text-gray-600">{order?.customer_phone}</p>
            </div>
            <div className="text-right">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">Payment Details</h3>
              <p className="text-sm">Method: Online (Razorpay)</p>
              <p className="text-sm text-gray-600">Ref: {order?.razorpay_payment_id || '—'}</p>
              <p className="text-sm mt-2">
                <span className="inline-block bg-black text-white text-xs px-2 py-1 uppercase tracking-wider">
                  Paid
                </span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left text-xs font-bold uppercase tracking-widest py-3 text-gray-500">#</th>
                <th className="text-left text-xs font-bold uppercase tracking-widest py-3 text-gray-500">Item</th>
                <th className="text-center text-xs font-bold uppercase tracking-widest py-3 text-gray-500">SKU</th>
                <th className="text-center text-xs font-bold uppercase tracking-widest py-3 text-gray-500">Qty</th>
                <th className="text-right text-xs font-bold uppercase tracking-widest py-3 text-gray-500">Price</th>
                <th className="text-right text-xs font-bold uppercase tracking-widest py-3 text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {order?.order_items?.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-3 text-sm">{idx + 1}</td>
                  <td className="py-3 text-sm font-medium">{item.product_name || 'Heritage Masterpiece'}</td>
                  <td className="py-3 text-sm text-center text-gray-500">{item.sku || '—'}</td>
                  <td className="py-3 text-sm text-center">{item.quantity}</td>
                  <td className="py-3 text-sm text-right">{formatCurrency(item.price)}</td>
                  <td className="py-3 text-sm text-right font-medium">{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-72">
              <div className="flex justify-between text-sm py-2">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(order?.subtotal || order?.total || 0)}</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-gray-500">Shipping</span>
                <span>{order?.shipping_fee === 0 ? 'Free' : formatCurrency(order?.shipping_fee || 0)}</span>
              </div>
              {order?.discount > 0 && (
                <div className="flex justify-between text-sm py-2">
                  <span className="text-gray-500">Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm py-2">
                <span className="text-gray-500">GST (Inclusive)</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-black mt-2">
                <span className="font-bold uppercase tracking-wider text-sm">Grand Total</span>
                <span className="font-bold text-lg">{formatCurrency(order?.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-300 pt-6 text-center">
            <p className="text-xs text-gray-500 mb-2">
              This is a computer-generated invoice and does not require a physical signature.
            </p>
            <p className="text-xs text-gray-400">
              Jhumkart Heritage Jewelry · www.jhumkart.com · support@jhumkart.com
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Thank you for your patronage. Your heritage piece is crafted with utmost care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
