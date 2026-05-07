import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/useAuth';

export function AuthCallback() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // This will pick up the tokens from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          navigate('/login');
          return;
        }
        
        if (session?.user) {
          // Fetch profile
          let profile = null;
          try {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            profile = data;
          } catch {}
          
          setAuth(session.user, profile);
          
          // Redirect to account or admin
          if (profile?.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/account', { replace: true });
          }
        } else {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error("Callback processing failed:", error);
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, setAuth]);

  return (
    <div className="min-h-screen bg-[#F7F1E6] flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#06251B] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[#8A6B4A] text-sm uppercase tracking-[0.2em] font-bold">Completing sign in...</p>
    </div>
  );
}
