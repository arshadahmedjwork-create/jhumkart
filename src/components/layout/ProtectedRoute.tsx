import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen bg-[#F7F1E6] flex items-center justify-center text-[#8A6B4A] uppercase tracking-widest text-sm">Authenticating...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && profile?.role !== 'admin') {
    return <Navigate to="/account" replace />;
  }

  return <Outlet />;
}
