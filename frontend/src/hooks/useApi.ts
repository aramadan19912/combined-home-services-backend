import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  servicesApi, categoriesApi, ordersApi, providersApi, reviewsApi,
  paymentsApi, complaintsApi, analyticsApi, dashboardsApi, 
  userProfileApi, notificationsApi
} from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { 
  CreateUpdateOrderDto, CreateReviewDto, PaymentRequestDto,
  CreateComplaintDto, UpdateUserProfileDto
} from '@/types/api';

// Services hooks
export const useServices = (query?: string, category?: string) => {
  return useQuery({
    queryKey: ['services', query, category],
    queryFn: () => servicesApi.getServices(query, category),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => servicesApi.getService(id),
    enabled: !!id,
  });
};

// Categories hooks
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePopularCategories = (count: number) => {
  return useQuery({
    queryKey: ['popular-categories', count],
    queryFn: () => categoriesApi.getPopularCategories(count),
    staleTime: 10 * 60 * 1000,
  });
};

// Orders hooks
export const useMyOrders = (maxResultCount?: number, skipCount?: number) => {
  return useQuery({
    queryKey: ['my-orders', maxResultCount, skipCount],
    queryFn: () => ordersApi.getMyOrders(maxResultCount, skipCount),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (orderData: CreateUpdateOrderDto) => ordersApi.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast({
        title: "Success",
        description: "Order created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create order",
        variant: "destructive",
      });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => ordersApi.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast({
        title: "Success",
        description: "Order cancelled successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel order",
        variant: "destructive",
      });
    },
  });
};

export const useAcceptOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => ordersApi.acceptOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['provider-dashboard'] });
      toast({
        title: "Success",
        description: "Order accepted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept order",
        variant: "destructive",
      });
    },
  });
};

export const useCompleteOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => ordersApi.completeOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['provider-dashboard'] });
      toast({
        title: "Success",
        description: "Order completed successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete order",
        variant: "destructive",
      });
    },
  });
};

// Providers hooks
export const useProviders = (query?: string, category?: string) => {
  return useQuery({
    queryKey: ['providers', query, category],
    queryFn: () => providersApi.getProviders(query, category),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProvider = (id: string) => {
  return useQuery({
    queryKey: ['provider', id],
    queryFn: () => providersApi.getProvider(id),
    enabled: !!id,
  });
};

export const useProviderStatus = () => {
  return useQuery({
    queryKey: ['provider-status'],
    queryFn: providersApi.getStatus,
  });
};

// Reviews hooks
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (reviewData: CreateReviewDto) => reviewsApi.createReview(reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: "Success",
        description: "Review submitted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });
};

export const useReviewsByOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['reviews', 'order', orderId],
    queryFn: () => reviewsApi.getReviewsByOrder(orderId),
    enabled: !!orderId,
  });
};

export const useReviewsByProvider = (providerId: string) => {
  return useQuery({
    queryKey: ['reviews', 'provider', providerId],
    queryFn: () => reviewsApi.getReviewsByProvider(providerId),
    enabled: !!providerId,
  });
};

// Payments hooks
export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (paymentData: PaymentRequestDto) => paymentsApi.createPayment(paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: "Success",
        description: "Payment processed successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Payment failed",
        variant: "destructive",
      });
    },
  });
};

export const usePayments = () => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: paymentsApi.getPayments,
  });
};

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: paymentsApi.getPaymentMethods,
  });
};

// Dashboard hooks
export const useCustomerDashboard = () => {
  return useQuery({
    queryKey: ['customer-dashboard'],
    queryFn: dashboardsApi.getCustomerDashboard,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useProviderDashboard = () => {
  return useQuery({
    queryKey: ['provider-dashboard'],
    queryFn: dashboardsApi.getProviderDashboard,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: dashboardsApi.getAdminDashboard,
    staleTime: 2 * 60 * 1000,
  });
};

// Analytics hooks
export const useDashboardAnalytics = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['analytics', 'dashboard', startDate, endDate],
    queryFn: () => analyticsApi.getDashboard(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
};

// User profile hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: userProfileApi.getProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (profileData: UpdateUserProfileDto) => userProfileApi.updateProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });
};

// Notifications hooks
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getNotifications,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Complaints hooks
export const useCreateComplaint = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (complaintData: CreateComplaintDto) => complaintsApi.createComplaint(complaintData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast({
        title: "Success",
        description: "Complaint submitted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit complaint",
        variant: "destructive",
      });
    },
  });
};

export const useMyComplaints = () => {
  return useQuery({
    queryKey: ['my-complaints'],
    queryFn: complaintsApi.getMyComplaints,
  });
};