import { createClient } from '@supabase/supabase-js';

// Supabase Configuration with optional environment variable overrides
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockkey';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth helper functions wrapper
export const supabaseAuth = {
  signUp: async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/login?verified=true`
        }
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  },

  signInWithPassword: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  },

  signInWithOAuth: async (provider: 'google') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  },

  resetPasswordForEmail: async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/profile?reset=true`
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  }
};
