import { Button } from "@/components/ui/button";
import { Bell, User, Menu, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { NotificationCenter } from "@/components/realtime/NotificationCenter";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

interface HeaderProps {
  userType?: 'customer' | 'provider' | 'admin' | null;
  onMobileMenuToggle?: () => void;
}

export const Header = ({ userType, onMobileMenuToggle }: HeaderProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { t } = useTranslation();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">{t('brand')}</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {!userType && (
              <>
                <Link to="/" className="nav-link">{t('nav.home')}</Link>
                <Link to="/services" className="nav-link">{t('nav.services')}</Link>
                <Link to="/how-it-works" className="nav-link">{t('nav.how')}</Link>
                <Link to="/about" className="nav-link">{t('nav.about')}</Link>
              </>
            )}
            
            {userType === 'customer' && (
              <>
                <Link to="/customer/browse" className="nav-link">{t('nav.browse')}</Link>
                <Link to="/customer/bookings" className="nav-link">{t('nav.bookings')}</Link>
                <Link to="/customer/complaints" className="nav-link">{t('nav.complaints')}</Link>
                <Link to="/customer/reviews" className="nav-link">{t('nav.reviews')}</Link>
              </>
            )}
            
            {userType === 'provider' && (
              <>
                <Link to="/provider/dashboard" className="nav-link">{t('nav.dashboard')}</Link>
                <Link to="/provider/orders" className="nav-link">{t('nav.orders')}</Link>
                <Link to="/provider/earnings" className="nav-link">{t('nav.earnings')}</Link>
                <Link to="/provider/services" className="nav-link">{t('nav.myServices')}</Link>
              </>
            )}
            
            {userType === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="nav-link">{t('nav.dashboard')}</Link>
                <Link to="/admin/users" className="nav-link">{t('nav.users')}</Link>
                <Link to="/admin/providers" className="nav-link">{t('nav.providers')}</Link>
                <Link to="/admin/analytics" className="nav-link">{t('nav.analytics')}</Link>
                <Link to="/admin/complaints" className="nav-link">{t('nav.complaints')}</Link>
              </>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {userType && <NotificationCenter />}
            <LanguageSwitcher />
            {!userType ? (
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost">{t('actions.signIn')}</Button>
                </Link>
                <Link to="/provider/register">
                  <Button className="btn-hero">{t('actions.becomeProvider')}</Button>
                </Link>
              </div>
            ) : (
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={onMobileMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};