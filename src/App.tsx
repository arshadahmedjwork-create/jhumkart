import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';

// Layouts
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// Public Pages
import { Home } from '@/pages/public/Home';
import { Shop } from '@/pages/public/Shop';
import { ProductDetail } from '@/pages/public/ProductDetail';
import { Checkout } from '@/pages/public/Checkout';
import { OrderSuccess } from '@/pages/public/OrderSuccess';
import { TrackOrder } from '@/pages/public/TrackOrder';
import { Login } from '@/pages/public/Login';
import { AuthCallback } from '@/pages/public/AuthCallback';
import { Account } from '@/pages/public/Account';

// Admin
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { Dashboard as AdminDashboard } from '@/pages/admin/Dashboard';
import { AdminOrders } from '@/pages/admin/AdminOrders';
import { AdminProducts } from '@/pages/admin/AdminProducts';
import { AdminCustomers } from '@/pages/admin/AdminCustomers';
import { AdminDrops } from '@/pages/admin/AdminDrops';
import { AdminCategories } from '@/pages/admin/AdminCategories';

import { About } from '@/pages/public/About';
import { Contact } from '@/pages/public/Contact';

import { Collections } from '@/pages/public/Collections';
import { Wishlist } from '@/pages/public/Wishlist';

// Cart is handled by CartDrawer component
const Cart = () => <div className="p-24 text-center">Cart Page</div>;

function App() {
  const { initialize } = useAuth();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/track-order/:orderId" element={<TrackOrder />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/account/*" element={<Account />} />
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="drops" element={<AdminDrops />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="customers" element={<AdminCustomers />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
