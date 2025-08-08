import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authClient } from '@/lib/api-client';
import { AuthResponse, LoginRequest, GoogleLoginRequest, JwtClaims, UserProfileDto } from '@/types/api';

interface AuthContextType {
  user: UserProfileDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  loginWithGoogle: (googleToken: GoogleLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getUserRole: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      try {
        const claims = jwtDecode<JwtClaims>(savedToken);
        const now = Date.now() / 1000;
        
        if (claims.exp && claims.exp > now) {
          setToken(savedToken);
          // Create user object from JWT claims
          setUser({
            id: claims.sub,
            name: claims.name,
            fullName: claims.name,
            email: claims.email,
            role: (claims.role as 'customer' | 'provider' | 'admin') || 'customer',
            userType: claims.role === 'admin' ? 'Admin' : claims.role === 'provider' ? 'Provider' : 'Customer',
            phoneNumber: '',
            isVerified: true,
            termsAccepted: true,
            privacyPolicyAccepted: true,
            failedLoginAttempts: 0,
            twoFactorEnabled: false
          });
        } else {
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('auth_token');
      }
    }
    setIsLoading(false);
  }, []);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (token) {
      try {
        const claims = jwtDecode<JwtClaims>(token);
        const now = Date.now() / 1000;
        const timeUntilExpiry = (claims.exp || 0) - now;
        
        // Refresh token 5 minutes before expiration
        if (timeUntilExpiry > 300) {
          const refreshTimeout = setTimeout(() => {
            refreshToken();
          }, (timeUntilExpiry - 300) * 1000);
          
          return () => clearTimeout(refreshTimeout);
        }
      } catch (error) {
        console.error('Error setting up token refresh:', error);
      }
    }
  }, [token]);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authClient.post<AuthResponse>('/api/auth/login', credentials);
      const { token: newToken } = response.data;
      
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      
      const claims = jwtDecode<JwtClaims>(newToken);
      setUser({
        id: claims.sub,
        name: claims.name,
        fullName: claims.name,
        email: claims.email,
        role: (claims.role as 'customer' | 'provider' | 'admin') || 'customer',
        userType: claims.role === 'admin' ? 'Admin' : claims.role === 'provider' ? 'Provider' : 'Customer',
        phoneNumber: '',
        isVerified: true,
        termsAccepted: true,
        privacyPolicyAccepted: true,
        failedLoginAttempts: 0,
        twoFactorEnabled: false
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (googleToken: GoogleLoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authClient.post<AuthResponse>('/api/auth/google', googleToken);
      const { token: newToken } = response.data;
      
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      
      const claims = jwtDecode<JwtClaims>(newToken);
      setUser({
        id: claims.sub,
        name: claims.name,
        fullName: claims.name,
        email: claims.email,
        role: (claims.role as 'customer' | 'provider' | 'admin') || 'customer',
        userType: claims.role === 'admin' ? 'Admin' : claims.role === 'provider' ? 'Provider' : 'Customer',
        phoneNumber: '',
        isVerified: true,
        termsAccepted: true,
        privacyPolicyAccepted: true,
        failedLoginAttempts: 0,
        twoFactorEnabled: false
      });
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (token) {
        await authClient.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const response = await authClient.post<AuthResponse>('/api/auth/refresh');
      const { token: newToken } = response.data;
      
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      
      const claims = jwtDecode<JwtClaims>(newToken);
      setUser(prev => prev ? {
        ...prev,
        name: claims.name,
        fullName: claims.name,
        email: claims.email,
      } : null);
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const getUserRole = (): string | null => {
    return user?.role || null;
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    refreshToken,
    getUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};