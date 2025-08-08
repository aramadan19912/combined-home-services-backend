import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Calendar, 
  User, 
  Menu,
  X,
  Bell,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const MobileNavigation = () => {
  const { user, getUserRole } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const userRole = getUserRole();

  const getTabItems = () => {
    const baseItems = [
      { icon: Home, label: 'Home', path: '/' },
      { icon: Search, label: 'Browse', path: '/customer/browse' },
    ];

    if (user) {
      if (userRole === 'customer') {
        return [
          ...baseItems,
          { icon: Calendar, label: 'Bookings', path: '/customer/bookings' },
          { icon: User, label: 'Profile', path: '/customer/dashboard' },
        ];
      } else if (userRole === 'provider') {
        return [
          { icon: Home, label: 'Dashboard', path: '/provider/dashboard' },
          { icon: Calendar, label: 'Orders', path: '/provider/orders' },
          { icon: User, label: 'Profile', path: '/provider/dashboard' },
        ];
      } else if (userRole === 'admin') {
        return [
          { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: User, label: 'Users', path: '/admin/users' },
        ];
      }
    }

    return baseItems;
  };

  const getMenuItems = () => {
    if (!user) return [];

    const baseItems = [
      { icon: Bell, label: 'Notifications', path: '/notifications' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    if (userRole === 'customer') {
      return [
        ...baseItems,
        { icon: User, label: 'Payment Methods', path: '/customer/payments' },
        { icon: User, label: 'Complaints', path: '/customer/complaints' },
      ];
    } else if (userRole === 'provider') {
      return [
        ...baseItems,
        { icon: User, label: 'Earnings', path: '/provider/earnings' },
      ];
    } else if (userRole === 'admin') {
      return [
        ...baseItems,
        { icon: User, label: 'Analytics', path: '/admin/analytics' },
        { icon: User, label: 'Providers', path: '/admin/providers' },
        { icon: User, label: 'Payments', path: '/admin/payments' },
        { icon: User, label: 'Complaints', path: '/admin/complaints' },
      ];
    }

    return baseItems;
  };

  const tabItems = getTabItems();
  const menuItems = getMenuItems();

  return (
    <>
      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
        <div className="flex items-center justify-around py-2">
          {tabItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Menu Trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="flex flex-col items-center py-2 px-3">
                <Menu className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Spacer for bottom navigation */}
      <div className="h-16 md:hidden" />
    </>
  );
};

export default MobileNavigation;