import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfileDto } from '@/types/api';

interface SupabaseAuthContextType {
  user: UserProfileDto | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfileDto>) => Promise<void>;
  getUserRole: () => string | null;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

interface SupabaseAuthProviderProps {
  children: ReactNode;
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        setSession(session);
        
        if (session?.user) {
          await syncUserProfile(session.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        setSession(session);
        
        if (session?.user) {
          await syncUserProfile(session.user);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const syncUserProfile = async (supabaseUser: User) => {
    try {
      // Get user metadata and role from Supabase
      const userMetadata = supabaseUser.user_metadata || {};
      const appMetadata = supabaseUser.app_metadata || {};
      
      // Map Supabase user to your app's user profile structure
      const userProfile: UserProfileDto = {
        id: supabaseUser.id,
        name: userMetadata.full_name || userMetadata.name || supabaseUser.email?.split('@')[0] || '',
        fullName: userMetadata.full_name || userMetadata.name || '',
        email: supabaseUser.email || '',
        role: (appMetadata.role || userMetadata.role || 'customer') as 'customer' | 'provider' | 'admin',
        userType: getUserType(appMetadata.role || userMetadata.role || 'customer'),
        phoneNumber: userMetadata.phone || '',
        isVerified: supabaseUser.email_confirmed_at !== null,
        termsAccepted: userMetadata.terms_accepted || false,
        privacyPolicyAccepted: userMetadata.privacy_accepted || false,
        failedLoginAttempts: 0,
        twoFactorEnabled: supabaseUser.app_metadata?.mfa_enabled || false
      };

      setUser(userProfile);
    } catch (error) {
      console.error('Error syncing user profile:', error);
    }
  };

  const getUserType = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'provider':
        return 'Provider';
      default:
        return 'Customer';
    }
  };

  const signUp = async (email: string, password: string, userData?: any): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.fullName || userData?.name || '',
            role: userData?.role || 'customer',
            terms_accepted: userData?.termsAccepted || false,
            privacy_accepted: userData?.privacyPolicyAccepted || false,
            ...userData
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user && !data.user.email_confirmed_at) {
        // Email confirmation required
        console.log('Please check your email for confirmation link');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfileDto>): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: updates.fullName,
          phone: updates.phoneNumber,
          ...updates
        }
      });

      if (error) {
        throw error;
      }

      // Update local user state
      if (user) {
        setUser({ ...user, ...updates });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const getUserRole = (): string | null => {
    return user?.role || null;
  };

  const value: SupabaseAuthContextType = {
    user,
    session,
    isAuthenticated: !!session && !!user,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    getUserRole
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};