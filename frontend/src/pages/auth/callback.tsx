import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (data.session) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Get user role to redirect to appropriate dashboard
          const userRole = data.session.user.app_metadata?.role || 
                          data.session.user.user_metadata?.role || 
                          'customer';
          
          setTimeout(() => {
            switch (userRole) {
              case 'provider':
                navigate('/provider/dashboard');
                break;
              case 'admin':
                navigate('/admin/dashboard');
                break;
              default:
                navigate('/customer/dashboard');
                break;
            }
          }, 2000);
        } else {
          throw new Error('No session found');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Authentication failed');
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    // Handle the auth callback
    handleAuthCallback();
  }, [navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return (
          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              {getStatusIcon()}
              <p className={`text-lg font-medium ${getStatusColor()}`}>
                {message}
              </p>
            </div>
            
            {status === 'loading' && (
              <div className="text-center text-sm text-gray-500">
                <p>Please wait while we complete your sign-in...</p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="text-center text-sm text-gray-500">
                <p>You will be redirected to the login page shortly.</p>
              </div>
            )}
            
            {status === 'success' && (
              <div className="text-center text-sm text-gray-500">
                <p>Welcome! You will be redirected to your dashboard shortly.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthCallback;