import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/useAuth';
import { Loader2 } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/account';

  // Redirect if already logged in
  if (user) {
    navigate(from, { replace: true });
    return null;
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Clear any stale session first
      await supabase.auth.signOut().catch(() => {});
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error("OAuth error:", error);
        throw error;
      }
      
      // If signInWithOAuth returns a URL, manually redirect
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setIsLoading(false);
      alert("Failed to login: " + (error.message || "Please try again."));
    }
  };

  return (
    <div className="bg-[#F7F1E6] min-h-[80vh] flex items-center justify-center py-24 px-4">
      <div className="bg-white p-8 md:p-12 border border-[#C99A45]/30 max-w-md w-full text-center">
        <h1 className="font-serif text-3xl text-[#06251B] mb-2">Welcome Back</h1>
        <p className="text-[#8A6B4A] text-sm mb-8">
          Sign in to access your registry, order history, and saved items.
        </p>

        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 border border-[#06251B] bg-white text-[#06251B] py-3 text-sm font-semibold hover:bg-[#E8E1D5] transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
          )}
          {isLoading ? 'Redirecting to Google...' : 'Continue with Google'}
        </button>

        <div className="mt-8 pt-8 border-t border-[#E8E1D5] text-xs text-[#8A6B4A]">
          By continuing, you agree to Jhumkart's <br/>
          <a href="#" className="underline hover:text-[#06251B]">Terms of Service</a> and <a href="#" className="underline hover:text-[#06251B]">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}
