import { apiClient, authClient, apiRequest } from '@/lib/api-client';
import {
  Service, Category, Order, CreateUpdateOrderDto, PagedResultDto,
  Provider, CreateReviewDto, Review, PaymentRequestDto, PaymentTransaction,
  CreateUpdateUserPaymentMethodDto, PaymentMethod, CreateComplaintDto,
  Complaint, AdminReplyDto, DashboardAnalyticsDto, CustomerDashboardDto,
  ProviderDashboardDto, AdminDashboardDto, UpdateUserProfileDto, UserProfile,
  Notification, TestNotificationDto, NotificationContentDto, FileUploadResponse,
  HealthMetrics, PerformanceMetrics
} from '@/types/api';

// Services API
export const servicesApi = {
  getServices: (query?: string, category?: string) =>
    apiRequest(() => apiClient.get<Service[]>('/api/service', { 
      params: { query, category } 
    })),

  getService: (id: string) =>
    apiRequest(() => apiClient.get<Service>(`/api/service/${id}`)),
};

// Categories API
export const categoriesApi = {
  getCategories: () =>
    apiRequest(() => apiClient.get<Category[]>('/api/category')),

  getCategory: (name: string) =>
    apiRequest(() => apiClient.get<Category>(`/api/category/${name}`)),

  getPopularCategories: (count: number) =>
    apiRequest(() => apiClient.get<Category[]>(`/api/category/popular/${count}`)),
};

// Orders API
export const ordersApi = {
  createOrder: (orderData: CreateUpdateOrderDto) =>
    apiRequest(() => apiClient.post<Order>('/api/order', orderData)),

  getMyOrders: (maxResultCount?: number, skipCount?: number) =>
    apiRequest(() => apiClient.get<PagedResultDto<Order>>('/api/order/my', {
      params: { maxResultCount, skipCount }
    })),

  updateOrder: (id: string, orderData: CreateUpdateOrderDto) =>
    apiRequest(() => apiClient.put<Order>(`/api/order/${id}`, orderData)),

  cancelOrder: (id: string) =>
    apiRequest(() => apiClient.post(`/api/order/${id}/cancel`)),

  acceptOrder: (id: string) =>
    apiRequest(() => apiClient.post(`/api/order/${id}/accept`)),

  completeOrder: (id: string) =>
    apiRequest(() => apiClient.post(`/api/order/${id}/complete`)),
};

// Providers API
export const providersApi = {
  getProviders: (query?: string, category?: string) =>
    apiRequest(() => apiClient.get<Provider[]>('/api/provider', {
      params: { query, category }
    })),

  getProvider: (id: string) =>
    apiRequest(() => apiClient.get<Provider>(`/api/provider/${id}`)),

  uploadId: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest(() => apiClient.post<FileUploadResponse>('/api/provider/upload-id', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }));
  },

  uploadCr: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest(() => apiClient.post<FileUploadResponse>('/api/provider/upload-cr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }));
  },

  getStatus: () =>
    apiRequest(() => apiClient.get<{ status: string }>('/api/provider/status')),

  // Admin endpoints
  admin: {
    getAll: () =>
      apiRequest(() => apiClient.get<Provider[]>('/api/provider/admin/all')),

    getById: (id: string) =>
      apiRequest(() => apiClient.get<Provider>(`/api/provider/admin/${id}`)),

    approve: (id: string) =>
      apiRequest(() => apiClient.post(`/api/provider/admin/approve/${id}`)),

    reject: (id: string) =>
      apiRequest(() => apiClient.post(`/api/provider/admin/reject/${id}`)),

    downloadId: (id: string) =>
      apiRequest(() => apiClient.get(`/api/provider/admin/download-id/${id}`, {
        responseType: 'blob'
      })),

    downloadCr: (id: string) =>
      apiRequest(() => apiClient.get(`/api/provider/admin/download-cr/${id}`, {
        responseType: 'blob'
      })),

    search: (status?: string) =>
      apiRequest(() => apiClient.get<Provider[]>('/api/provider/admin/search', {
        params: { status }
      })),

    bulkApprove: (ids: string[]) =>
      apiRequest(() => apiClient.post('/api/provider/admin/bulk-approve', ids)),

    bulkReject: (data: { ids: string[]; reason: string }) =>
      apiRequest(() => apiClient.post('/api/provider/admin/bulk-reject', data)),
  }
};

// Reviews API
export const reviewsApi = {
  createReview: (reviewData: CreateReviewDto) =>
    apiRequest(() => apiClient.post<Review>('/api/review', reviewData)),

  getReviewsByOrder: (orderId: string) =>
    apiRequest(() => apiClient.get<Review[]>(`/api/review/by-order/${orderId}`)),

  getReviewsByProvider: (providerId: string) =>
    apiRequest(() => apiClient.get<Review[]>(`/api/review/by-provider/${providerId}`)),
};

// Payments API
export const paymentsApi = {
  createPayment: (paymentData: PaymentRequestDto) =>
    apiRequest(() => apiClient.post<{ success: boolean }>('/api/payments', paymentData)),

  getPaymentsByOrder: (orderId: string) =>
    apiRequest(() => apiClient.get<PaymentTransaction[]>(`/api/payments/order/${orderId}`)),

  getPayments: () =>
    apiRequest(() => apiClient.get<PaymentTransaction[]>('/api/payments')),

  getPaymentStatus: (orderId: string) =>
    apiRequest(() => apiClient.get<{ status: string }>(`/api/payments/status/${orderId}`)),

  getReceipt: (transactionId: string) =>
    apiRequest(() => apiClient.get(`/api/payments/receipt/${transactionId}`, {
      responseType: 'blob'
    })),

  getPaymentMethods: () =>
    apiRequest(() => apiClient.get<PaymentMethod[]>('/api/payments/methods')),

  createPaymentMethod: (methodData: CreateUpdateUserPaymentMethodDto) =>
    apiRequest(() => apiClient.post<PaymentMethod>('/api/payments/methods', methodData)),

  deletePaymentMethod: (methodId: string) =>
    apiRequest(() => apiClient.delete(`/api/payments/methods/${methodId}`)),

  // Admin endpoints
  admin: {
    refund: (transactionId: string) =>
      apiRequest(() => apiClient.post(`/api/payments/refund/${transactionId}`)),

    partialRefund: (transactionId: string, amount: number) =>
      apiRequest(() => apiClient.post(`/api/payments/refund-partial/${transactionId}`, { amount })),

    retry: (transactionId: string) =>
      apiRequest(() => apiClient.post(`/api/payments/retry/${transactionId}`)),
  }
};

// Complaints API
export const complaintsApi = {
  createComplaint: (complaintData: CreateComplaintDto) =>
    apiRequest(() => apiClient.post<Complaint>('/api/complaints', complaintData)),

  getMyComplaints: () =>
    apiRequest(() => apiClient.get<Complaint[]>('/api/complaints/my')),

  uploadAttachment: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest(() => apiClient.post<FileUploadResponse>('/api/complaints/upload-attachment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }));
  },

  downloadAttachment: (fileName: string) =>
    apiRequest(() => apiClient.get(`/api/complaints/download-attachment/${fileName}`, {
      responseType: 'blob'
    })),

  // Admin endpoints
  admin: {
    getComplaints: () =>
      apiRequest(() => apiClient.get<Complaint[]>('/api/complaints')),

    reply: (id: string, replyData: AdminReplyDto) =>
      apiRequest(() => apiClient.post(`/api/complaints/reply/${id}`, replyData)),

    escalate: (id: string, reason: string) =>
      apiRequest(() => apiClient.post(`/api/complaints/admin/escalate/${id}`, reason)),

    assign: (id: string, adminId: string) =>
      apiRequest(() => apiClient.post(`/api/complaints/admin/assign/${id}`, adminId)),

    reopen: (id: string) =>
      apiRequest(() => apiClient.post(`/api/complaints/admin/reopen/${id}`)),

    getAuditLogs: (complaintId: string) =>
      apiRequest(() => apiClient.get(`/api/complaints/admin/audit-logs`, {
        params: { complaintId }
      })),

    getStats: () =>
      apiRequest(() => apiClient.get('/api/complaints/admin/stats')),
  }
};

// Analytics API
export const analyticsApi = {
  getDashboard: (startDate?: string, endDate?: string) =>
    apiRequest(() => apiClient.get<DashboardAnalyticsDto>('/api/analytics/dashboard', {
      params: { startDate, endDate }
    })),

  getUsers: (startDate?: string, endDate?: string) =>
    apiRequest(() => apiClient.get('/api/analytics/users', {
      params: { startDate, endDate }
    })),

  getOrders: (startDate?: string, endDate?: string) =>
    apiRequest(() => apiClient.get('/api/analytics/orders', {
      params: { startDate, endDate }
    })),

  getRevenue: (startDate?: string, endDate?: string) =>
    apiRequest(() => apiClient.get('/api/analytics/revenue', {
      params: { startDate, endDate }
    })),

  getServices: (startDate?: string, endDate?: string) =>
    apiRequest(() => apiClient.get('/api/analytics/services', {
      params: { startDate, endDate }
    })),

  getProviders: (startDate?: string, endDate?: string) =>
    apiRequest(() => apiClient.get('/api/analytics/providers', {
      params: { startDate, endDate }
    })),

  getRealtime: () =>
    apiRequest(() => apiClient.get('/api/analytics/realtime')),
};

// Dashboards API
export const dashboardsApi = {
  getCustomerDashboard: () =>
    apiRequest(() => apiClient.get<CustomerDashboardDto>('/api/dashboard/customer-dashboard')),

  getProviderDashboard: () =>
    apiRequest(() => apiClient.get<ProviderDashboardDto>('/api/dashboard/provider-dashboard')),

  getAdminDashboard: () =>
    apiRequest(() => apiClient.get<AdminDashboardDto>('/api/dashboard/admin-dashboard')),
};

// Monitoring API
export const monitoringApi = {
  getHealth: () =>
    apiRequest(() => apiClient.get<HealthMetrics>('/api/monitoring/health')),

  getPerformance: () =>
    apiRequest(() => apiClient.get<PerformanceMetrics>('/api/monitoring/performance')),

  getDatabase: () =>
    apiRequest(() => apiClient.get('/api/monitoring/database')),

  getSecurity: () =>
    apiRequest(() => apiClient.get('/api/monitoring/security')),

  getLogs: () =>
    apiRequest(() => apiClient.get('/api/monitoring/logs')),

  getConfig: () =>
    apiRequest(() => apiClient.get('/api/monitoring/config')),

  updateConfig: (config: any) =>
    apiRequest(() => apiClient.put('/api/monitoring/config', config)),
};

// User Profile API
export const userProfileApi = {
  getProfile: () =>
    apiRequest(() => apiClient.get<UserProfile>('/api/userprofile')),

  updateProfile: (profileData: UpdateUserProfileDto) =>
    apiRequest(() => apiClient.put<UserProfile>('/api/userprofile', profileData)),

  setFcmToken: (token: string) =>
    apiRequest(() => apiClient.post('/api/userprofile/fcm-token', { token })),

  getFcmToken: () =>
    apiRequest(() => apiClient.get<{ token: string }>('/api/userprofile/fcm-token')),
};

// Notifications API
export const notificationsApi = {
  getNotifications: () =>
    apiRequest(() => apiClient.get<Notification[]>('/api/notification')),

  markAsRead: (id: string) =>
    apiRequest(() => apiClient.post(`/api/notification/${id}/read`)),

  testNotification: (notificationData: TestNotificationDto) =>
    apiRequest(() => apiClient.post('/api/notification/test', notificationData)),

  sendToMe: (contentData: NotificationContentDto) =>
    apiRequest(() => apiClient.post('/api/notification/me', contentData)),
};