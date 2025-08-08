import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, User, Settings, BarChart3, Users, DollarSign, Calendar, Star, Briefcase } from 'lucide-react';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: number;
}

export const useRoleBasedNavigation = () => {
  const { user, getUserRole } = useAuth();
  const userRole = getUserRole();

  const navigationItems: NavigationItem[] = [
    // Customer Navigation
    { path: '/', label: 'Home', icon: Home, roles: ['customer', 'provider', 'admin'] },
    { path: '/browse', label: 'Browse Services', icon: Briefcase, roles: ['customer'] },
    { path: '/bookings', label: 'My Bookings', icon: Calendar, roles: ['customer'] },
    { path: '/payments', label: 'Payments', icon: DollarSign, roles: ['customer'] },
    
    // Provider Navigation  
    { path: '/provider/dashboard', label: 'Dashboard', icon: BarChart3, roles: ['provider'] },
    { path: '/provider/orders', label: 'Orders', icon: Calendar, roles: ['provider'] },
    { path: '/provider/earnings', label: 'Earnings', icon: DollarSign, roles: ['provider'] },
    
    // Admin Navigation
    { path: '/admin/dashboard', label: 'Admin Dashboard', icon: BarChart3, roles: ['admin'] },
    { path: '/admin/users', label: 'User Management', icon: Users, roles: ['admin'] },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin'] },
    { path: '/admin/payments', label: 'Payment Management', icon: DollarSign, roles: ['admin'] },
    
    // Common Navigation
    { path: '/profile', label: 'Profile', icon: User, roles: ['customer', 'provider', 'admin'] },
    { path: '/settings', label: 'Settings', icon: Settings, roles: ['customer', 'provider', 'admin'] },
  ];

  const getFilteredNavigation = () => {
    if (!user || !userRole) return [];
    
    return navigationItems.filter(item => item.roles.includes(userRole));
  };

  const getDefaultRoute = () => {
    switch (userRole) {
      case 'admin': return '/admin/dashboard';
      case 'provider': return '/provider/dashboard';
      case 'customer': return '/';
      default: return '/';
    }
  };

  const hasAccess = (path: string) => {
    const item = navigationItems.find(nav => nav.path === path);
    return item ? item.roles.includes(userRole || '') : false;
  };

  return {
    navigationItems: getFilteredNavigation(),
    defaultRoute: getDefaultRoute(),
    hasAccess,
  };
};