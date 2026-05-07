import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  setAuth: (user: User | null, profile: Profile | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  } catch {
    return null;
  }
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  setAuth: (user, profile) => set({ user, profile, loading: false }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },
  initialize: async () => {
    // Prevent re-initialization if already loaded
    if (!get().loading && get().user) return; 

    set({ loading: true });

    try {
      // Use a race to prevent hanging on getSession
      const sessionResult = await Promise.race([
        supabase.auth.getSession(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000))
      ]);

      if (sessionResult && 'data' in sessionResult && sessionResult.data?.session?.user) {
        const user = sessionResult.data.session.user;
        const profile = await fetchProfile(user.id);
        set({ user, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    } catch (error) {
      console.error("Auth init error:", error);
      set({ user: null, profile: null, loading: false });
    }

    // Listen for future auth changes (sign in, sign out, token refresh)
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        set({ user: session.user, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });
  }
}));
