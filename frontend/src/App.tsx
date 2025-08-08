import React, { Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MobileNavigation from "@/components/mobile/MobileNavigation";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { trackPageview } from "@/lib/analytics";
import ErrorBoundary from "@/components/error/ErrorBoundary";

const Index = React.lazy(() => import('./pages/Index'));
const Login = React.lazy(() => import('./pages/Login'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const CustomerDashboard = React.lazy(() => import('./pages/customer/Dashboard'));
const CustomerBrowse = React.lazy(() => import('./pages/customer/Browse'));
const CustomerBookings = React.lazy(() => import('./pages/customer/Bookings'));
const CustomerComplaints = React.lazy(() => import('./pages/customer/Complaints'));
const BookService = React.lazy(() => import('./pages/customer/BookService'));
const BookingSuccess = React.lazy(() => import('./pages/customer/BookingSuccess'));
const ProviderDashboard = React.lazy(() => import('./pages/provider/Dashboard'));
const ProviderOrders = React.lazy(() => import('./pages/provider/Orders'));
const ProviderEarnings = React.lazy(() => import('./pages/provider/Earnings'));
const ProviderRegister = React.lazy(() => import('./pages/provider/Register'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = React.lazy(() => import('./pages/admin/Users'));
const AdminAnalytics = React.lazy(() => import('./pages/admin/Analytics'));
const AdminComplaints = React.lazy(() => import('./pages/admin/Complaints'));
const AdminProviders = React.lazy(() => import('./pages/admin/Providers'));
const Settings = React.lazy(() => import('./pages/Settings'));


const queryClient = new QueryClient();

function RouterAnalytics() {
  const location = useLocation();
  useEffect(() => {
    trackPageview(location.pathname + location.search);
  }, [location]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <RouterAnalytics />
            <div className="min-h-screen bg-background">
              <Suspense fallback={<div className="p-8">Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  {/* Customer Routes */}
                  <Route path="/customer/dashboard" element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/customer/browse" element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <CustomerBrowse />
                    </ProtectedRoute>
                  } />
                  <Route path="/customer/bookings" element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <CustomerBookings />
                    </ProtectedRoute>
                  } />
                  <Route path="/customer/book" element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <BookService />
                    </ProtectedRoute>
                  } />
                  <Route path="/customer/booking-success" element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <BookingSuccess />
                    </ProtectedRoute>
                  } />
                  <Route path="/customer/complaints" element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <CustomerComplaints />
                    </ProtectedRoute>
                  } />
                  {/* Provider Routes */}
                  <Route path="/provider/dashboard" element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <ProviderDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/provider/orders" element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <ProviderOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="/provider/earnings" element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <ProviderEarnings />
                    </ProtectedRoute>
                  } />
                  <Route path="/provider/register" element={<ProviderRegister />} />
                  {/* Admin Routes */}
                  <Route path="/admin/dashboard" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/users" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminUsers />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/analytics" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminAnalytics />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/providers" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminProviders />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/complaints" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminComplaints />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={<Settings />} />
                  {/* Catch-all route must be last */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <InstallPrompt />
              <MobileNavigation />
            </div>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
