import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Truck, Package, Clock, ArrowLeft } from 'lucide-react';

export function TrackOrder() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(quantity, price_at_time, product:products(name, product_images(image_url)))
          `)
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order tracking", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="bg-[#F7F1E6] min-h-screen py-24 flex justify-center items-center">
        <p className="text-[#8A6B4A] uppercase tracking-widest text-sm animate-pulse">Locating your order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#F7F1E6] min-h-screen py-24 flex flex-col items-center">
        <h2 className="font-serif text-3xl text-[#06251B] mb-6">Order Not Found</h2>
        <p className="text-[#8A6B4A] mb-8">We couldn't locate this order. Please ensure you are logged in if this was not a guest purchase.</p>
        <Link to="/account" className="bg-[#0F3D2E] text-[#F7F1E6] px-8 py-3 uppercase tracking-widest text-sm hover:bg-[#C99A45] hover:text-[#06251B] transition-colors">
          View My Orders
        </Link>
      </div>
    );
  }

  const steps = [
    { id: 'processing', label: 'Order Processing', icon: Clock, completed: true },
    { id: 'shipped', label: 'Shipped', icon: Package, completed: ['shipped', 'delivered'].includes(order.order_status) },
    { id: 'out', label: 'Out for Delivery', icon: Truck, completed: ['delivered'].includes(order.order_status) },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle, completed: order.order_status === 'delivered' },
  ];

  return (
    <div className="bg-[#F7F1E6] min-h-screen py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <div className="mb-8">
          <Link to="/account" className="inline-flex items-center gap-2 text-[#8A6B4A] hover:text-[#06251B] transition-colors text-sm uppercase tracking-widest font-semibold">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl text-[#06251B] mb-2">Track Order</h1>
        <p className="text-[#8A6B4A] mb-10">Order Number: <span className="font-mono text-sm text-[#06251B]">{order.order_number}</span></p>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Col - Timeline */}
          <div className="flex-1 bg-white p-8 border border-[#C99A45]/30">
            <h2 className="font-serif text-xl text-[#06251B] mb-8 border-b border-[#E8E1D5] pb-2">Order Status</h2>
            
            <div className="relative border-l-2 border-[#E8E1D5] ml-6 space-y-12 pb-4">
              {steps.map((step) => {
                const Icon = step.icon;
                const isCompleted = step.completed;
                const isCurrent = order.order_status === step.id || (order.order_status === 'processing' && step.id === 'processing') || (order.order_status === 'pending' && step.id === 'processing');

                return (
                  <div key={step.id} className="relative pl-8">
                    <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${isCompleted ? 'bg-[#0F3D2E] text-white' : 'bg-[#E8E1D5] text-[#8A6B4A]'}`}>
                      <Icon size={14} />
                    </div>
                    <h3 className={`font-serif text-lg ${isCompleted ? 'text-[#06251B]' : 'text-[#8A6B4A]'}`}>{step.label}</h3>
                    {isCurrent && <p className="text-xs text-[#8A6B4A] mt-1">This is the current status of your order.</p>}
                  </div>
                );
              })}
            </div>
            
            {order.order_status === 'cancelled' && (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
                <CheckCircle className="text-red-600" />
                This order has been cancelled.
              </div>
            )}
          </div>

          {/* Right Col - Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white p-8 border border-[#C99A45]/30 mb-6">
              <h2 className="font-serif text-xl text-[#06251B] mb-6 border-b border-[#E8E1D5] pb-2">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {order.order_items?.map((item: any) => {
                  return (
                    <div key={item.id || item.product_name} className="flex gap-4">
                      <div className="w-16 h-16 bg-[#F7F1E6] border border-[#E8E1D5] flex-shrink-0 relative">
                        <span className="absolute -top-2 -right-2 bg-[#8A6B4A] text-[#F7F1E6] text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[#06251B] font-serif text-sm line-clamp-1">{item.product_name || 'Artifact'}</p>
                        <p className="text-[#8A6B4A] text-xs">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-[#06251B] pt-4 mt-6">
                <div className="flex justify-between items-center">
                  <span className="uppercase tracking-widest font-bold text-[#06251B]">Total Amount</span>
                  <span className="font-serif text-xl text-[#06251B]">₹{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 border border-[#C99A45]/30">
              <h2 className="font-serif text-xl text-[#06251B] mb-6 border-b border-[#E8E1D5] pb-2">Shipping Details</h2>
              <div className="text-sm text-[#1A1510] space-y-1">
                <p className="font-semibold">{order.shipping_address?.firstName} {order.shipping_address?.lastName}</p>
                <p>{order.shipping_address?.address}</p>
                <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode}</p>
                <p className="mt-2 text-[#8A6B4A]">Ph: {order.shipping_address?.phone}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
