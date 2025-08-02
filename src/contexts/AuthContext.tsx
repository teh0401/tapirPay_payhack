import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string, icNumber?: string, phoneNumber?: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  loginAsDemoUser: (userId: string) => void; // New bypass method
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Cleanup function to remove all auth-related storage
  const cleanupAuthState = () => {
    // Remove standard auth tokens
    try {
      localStorage.removeItem('supabase.auth.token');
      // Remove all Supabase auth keys from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      // Remove from sessionStorage if in use
      Object.keys(sessionStorage || {}).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Error cleaning up auth state:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Remove any existing demo sessions first
    delete (window as any).__supabase_demo_session;
    
    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);


  const signIn = async (emailOrIdentifier: string, password: string) => {
    try {
      // Clean up existing state before attempting sign in
      cleanupAuthState();
      
      // Attempt global sign out first (ignore errors)
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.warn('Pre-login signout failed, continuing:', err);
      }

      let email = emailOrIdentifier;
      
      // Check if the input is not an email (i.e., it's an IC number or phone number)
      if (!emailOrIdentifier.includes('@')) {
        try {
          console.log('Looking up account for:', emailOrIdentifier);
          
          // Look up the email associated with this IC number or phone number
          console.log('Searching for identifier:', emailOrIdentifier);
          
          // Try searching by digital_id first
          let { data: profileData, error: lookupError } = await supabase
            .from('profiles')
            .select('email, phone, digital_id')
            .eq('digital_id', emailOrIdentifier)
            .maybeSingle();
          
          // If not found, try searching by phone
          if (!profileData && !lookupError) {
            const result = await supabase
              .from('profiles')
              .select('email, phone, digital_id')
              .eq('phone', emailOrIdentifier)
              .maybeSingle();
            profileData = result.data;
            lookupError = result.error;
          }
          
          console.log('Lookup result:', { profileData, lookupError });
          
          if (lookupError) {
            console.error('Lookup error:', lookupError);
            return { error: { message: 'Error looking up account. Please try again.' } };
          }
          
          if (!profileData?.email) {
            return { error: { message: `No account found with this ${emailOrIdentifier.includes('+') ? 'phone number' : 'IC number'}. Please check your details or sign up first.` } };
          }
          
          email = profileData.email;
          console.log('Found email:', email);
        } catch (error) {
          return { error: { message: 'Error looking up account. Please try again.' } };
        }
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      if (data.user) {
        // Force page reload for clean state
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }
      
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: { message: 'Sign in failed. Please try again.' } };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string, icNumber?: string, phoneNumber?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          ic_number: icNumber,
          phone_number: phoneNumber
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    try {
      // Check if this is a demo session (mock session)
      if (session?.access_token === 'demo-bypass-token') {
        // For demo sessions, just clear the local state
        setUser(null);
        setSession(null);
        cleanupAuthState();
        return { error: null };
      }
      
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out (ignore errors)
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.warn('Global signout failed, continuing with local cleanup:', err);
      }
      
      // Clear state regardless to ensure UI updates
      setUser(null);
      setSession(null);
      
      // Force page reload for a clean state
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
      
      return { error: null };
    } catch (error) {
      console.error('Error during signOut:', error);
      // Even if there's an error, clear everything and redirect
      cleanupAuthState();
      setUser(null);
      setSession(null);
      window.location.href = '/auth';
      return { error: null };
    }
  };

  // Direct bypass method - completely ignores authentication
  const loginAsDemoUser = (userId: string) => {
    console.log("Bypassing all auth, logging in directly as user:", userId);
    
    const mockUser = {
      id: userId,
      aud: 'authenticated',
      role: 'authenticated',
      email: 'demo@mydigitalid.gov.my',
      email_confirmed_at: new Date().toISOString(),
      phone: '',
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      app_metadata: {
        provider: 'demo',
        providers: ['demo']
      },
      user_metadata: {
        full_name: 'Demo',
      },
      identities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as User;

    const mockSession = {
      access_token: 'demo-bypass-token',
      refresh_token: 'demo-bypass-refresh',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: mockUser
    } as Session;

    // Directly set the state, bypassing all Supabase auth
    setUser(mockUser);
    setSession(mockSession);
    setLoading(false);
    
    console.log("Demo user session set directly:", mockUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      loginAsDemoUser, // Add the new bypass method
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}