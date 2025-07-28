
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthError, AuthTokenResponsePassword } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: AuthError | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: AuthError | null;
    data: any;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Primeiro, invalidar todas as sessões anteriores do usuário
      const { data: userData } = await supabase.auth.signInWithPassword({ email, password });
      
      if (userData.user && userData.session) {
        // Invalidar sessões anteriores
        await supabase.rpc('invalidate_previous_sessions', { 
          user_uuid: userData.user.id 
        });
        
        // Registrar nova sessão ativa
        await supabase.from('active_sessions').insert({
          user_id: userData.user.id,
          session_id: userData.session.access_token.substring(0, 50),
          device_info: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          },
          ip_address: 'unknown'
        });
      }
      
      setIsLoading(false);
      return {
        error: null,
        data: userData.session
      };
    } catch (error: any) {
      setIsLoading(false);
      return {
        error: error,
        data: null
      };
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    setIsLoading(false);
    return {
      error: response.error,
      data: response.data
    };
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      // Clear any existing auth state
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // Force page reload even if sign out fails
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
