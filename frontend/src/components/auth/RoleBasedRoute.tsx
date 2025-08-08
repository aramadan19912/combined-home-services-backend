import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
  showAccessDenied?: boolean;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/login',
  showAccessDenied = true,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role permissions
  if (!user || !allowedRoles.includes(user.role)) {
    if (showAccessDenied) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to access this page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <p>Current role: <span className="font-medium capitalize">{user?.role}</span></p>
                <p>Required roles: <span className="font-medium">{allowedRoles.join(', ')}</span></p>
              </div>
              <div className="flex flex-col space-y-2">
                <Button onClick={() => window.history.back()} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button onClick={() => window.location.href = '/'}>
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    // Silent redirect for cases where we don't want to show access denied
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Helper hook for role-based functionality
export const useRolePermissions = () => {
  const { user } = useAuth();

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const isProvider = (): boolean => {
    return hasRole('provider');
  };

  const isCustomer = (): boolean => {
    return hasRole('customer');
  };

  const canAccess = (requiredRoles: string[]): boolean => {
    return hasAnyRole(requiredRoles);
  };

  return {
    user,
    hasRole,
    hasAnyRole,
    isAdmin,
    isProvider,
    isCustomer,
    canAccess,
  };
};