import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';

export function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <CartDrawer />
      <main className="flex-grow pt-[72px] md:pt-[88px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
