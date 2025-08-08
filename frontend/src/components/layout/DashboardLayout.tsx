import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  BarChart3,
  Calendar,
  DollarSign,
  MessageSquare,
  Bell,
  Search,
  Plus,
  ShoppingBag,
  ClipboardList,
  UserCheck,
  AlertCircle,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useRolePermissions } from '@/components/auth/RoleBasedRoute';
import { toast } from '@/hooks/use-toast';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  roles: string[];
}

const getNavItems = (): NavItem[] => [
  // Common items
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['customer', 'provider', 'admin'],
  },
  
  // Customer specific
  {
    title: 'Browse Services',
    href: '/customer/browse',
    icon: Search,
    roles: ['customer'],
  },
  {
    title: 'My Bookings',
    href: '/customer/bookings',
    icon: Calendar,
    roles: ['customer'],
  },
  
  // Provider specific
  {
    title: 'My Orders',
    href: '/provider/orders',
    icon: ClipboardList,
    badge: '3',
    roles: ['provider'],
  },
  {
    title: 'Earnings',
    href: '/provider/earnings',
    icon: DollarSign,
    roles: ['provider'],
  },
  {
    title: 'My Services',
    href: '/provider/services',
    icon: Wrench,
    roles: ['provider'],
  },
  
  // Admin specific
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    roles: ['admin'],
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    roles: ['admin'],
  },
  {
    title: 'Provider Management',
    href: '/admin/providers',
    icon: UserCheck,
    badge: '2',
    roles: ['admin'],
  },
  {
    title: 'Complaints',
    href: '/admin/complaints',
    icon: AlertCircle,
    badge: '5',
    roles: ['admin'],
  },
  
  // Common items at bottom
  {
    title: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    badge: '2',
    roles: ['customer', 'provider', 'admin'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['customer', 'provider', 'admin'],
  },
];

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { canAccess } = useRolePermissions();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = getNavItems().filter(item => canAccess(item.roles));

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'provider': return 'Service Provider';
      case 'customer': return 'Customer';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'provider': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? 'p-4' : 'p-6'}`}>
      {/* Logo */}
      <div className="flex items-center space-x-2 mb-8">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Home className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-xl">ServiceHub</span>
      </div>

      {/* User Info */}
      <div className="mb-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImage} />
            <AvatarFallback>{user?.name?.charAt(0) || user?.fullName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.name || user?.fullName}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className={`text-xs ${getRoleBadgeColor(user?.role || '')}`}>
                {getRoleDisplayName(user?.role || '')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              onClick={() => mobile && setSidebarOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-5 w-5 ${active ? 'text-primary-foreground' : ''}`} />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <Badge 
                  variant={active ? "secondary" : "destructive"} 
                  className="h-5 px-2 text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="pt-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-lg">Menu</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Sidebar mobile />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:bg-background lg:border-r lg:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Search bar */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick action button */}
              {user?.role === 'customer' && (
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Book Service
                </Button>
              )}
              {user?.role === 'provider' && (
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              )}

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.profileImage} />
                      <AvatarFallback>{user?.name?.charAt(0) || user?.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name || user?.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Account Settings</Link>
                  </DropdownMenuItem>
                  {user?.role === 'provider' && (
                    <DropdownMenuItem asChild>
                      <Link to="/provider/profile">Provider Profile</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};