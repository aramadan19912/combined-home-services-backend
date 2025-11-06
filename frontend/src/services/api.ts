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

  getReview: (id: string) =>
    apiRequest(() => apiClient.get<any>(`/api/review/${id}`)),

  updateReview: (id: string, reviewData: any) =>
    apiRequest(() => apiClient.put<any>(`/api/review/${id}`, reviewData)),

  deleteReview: (id: string) =>
    apiRequest(() => apiClient.delete(`/api/review/${id}`)),

  markHelpful: (id: string) =>
    apiRequest(() => apiClient.post(`/api/review/${id}/helpful`)),

  markNotHelpful: (id: string) =>
    apiRequest(() => apiClient.post(`/api/review/${id}/not-helpful`)),

  addProviderResponse: (id: string, response: string) =>
    apiRequest(() => apiClient.post(`/api/review/${id}/provider-response`, { response })),

  moderate: (id: string, status: string, notes?: string) =>
    apiRequest(() => apiClient.post(`/api/review/${id}/moderate`, { status, notes })),

  reportReview: (id: string, reason: string) =>
    apiRequest(() => apiClient.post(`/api/review/${id}/report`, { reason })),
};

// Invoices API
export const invoicesApi = {
  getInvoice: (id: string) =>
    apiRequest(() => apiClient.get<any>(`/api/invoice/${id}`)),

  getInvoices: (maxResultCount?: number, skipCount?: number) =>
    apiRequest(() => apiClient.get<PagedResultDto<any>>('/api/invoice', {
      params: { maxResultCount, skipCount }
    })),

  getInvoiceByOrder: (orderId: string) =>
    apiRequest(() => apiClient.get<any>(`/api/invoice/by-order/${orderId}`)),

  getInvoicesByProvider: (providerId: string, maxResultCount?: number, skipCount?: number) =>
    apiRequest(() => apiClient.get<PagedResultDto<any>>(`/api/invoice/by-provider/${providerId}`, {
      params: { maxResultCount, skipCount }
    })),

  getInvoicesByCustomer: (customerId: string, maxResultCount?: number, skipCount?: number) =>
    apiRequest(() => apiClient.get<PagedResultDto<any>>(`/api/invoice/by-customer/${customerId}`, {
      params: { maxResultCount, skipCount }
    })),

  createInvoice: (invoiceData: any) =>
    apiRequest(() => apiClient.post<any>('/api/invoice', invoiceData)),

  updateInvoice: (id: string, invoiceData: any) =>
    apiRequest(() => apiClient.put<any>(`/api/invoice/${id}`, invoiceData)),

  deleteInvoice: (id: string) =>
    apiRequest(() => apiClient.delete(`/api/invoice/${id}`)),

  markAsPaid: (id: string, paidAmount: number) =>
    apiRequest(() => apiClient.post<any>(`/api/invoice/${id}/mark-paid`, paidAmount)),

  cancelInvoice: (id: string) =>
    apiRequest(() => apiClient.post<any>(`/api/invoice/${id}/cancel`)),

  downloadPdf: (id: string) =>
    apiRequest(() => apiClient.get(`/api/invoice/${id}/pdf`, {
      responseType: 'blob'
    })),
};

// Chat Messages API
export const chatApi = {
  getMessages: (orderId: string, maxResultCount?: number, skipCount?: number) =>
    apiRequest(() => apiClient.get<PagedResultDto<any>>(`/api/chat/order/${orderId}`, {
      params: { maxResultCount, skipCount }
    })),

  sendMessage: (messageData: any) =>
    apiRequest(() => apiClient.post<any>('/api/chat', messageData)),

  markAsRead: (id: string) =>
    apiRequest(() => apiClient.post(`/api/chat/${id}/mark-read`)),

  markAsDelivered: (id: string) =>
    apiRequest(() => apiClient.post(`/api/chat/${id}/mark-delivered`)),

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest(() => apiClient.post<FileUploadResponse>('/api/chat/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }));
  },

  uploadVoice: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest(() => apiClient.post<FileUploadResponse>('/api/chat/upload-voice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }));
  },

  deleteMessage: (id: string) =>
    apiRequest(() => apiClient.delete(`/api/chat/${id}`)),
};

// Provider Location/Tracking API
export const trackingApi = {
  getProviderLocation: (providerId: string) =>
    apiRequest(() => apiClient.get<any>(`/api/tracking/provider/${providerId}`)),

  updateProviderLocation: (locationData: any) =>
    apiRequest(() => apiClient.post<any>('/api/tracking/update', locationData)),

  getLocationHistory: (providerId: string, startDate?: string, endDate?: string) =>
    apiRequest(() => apiClient.get<any[]>(`/api/tracking/provider/${providerId}/history`, {
      params: { startDate, endDate }
    })),

  setOnlineStatus: (isOnline: boolean) =>
    apiRequest(() => apiClient.post('/api/tracking/status', { isOnline })),
};

// Service Categories API (Enhanced)
export const serviceCategoriesApi = {
  getCategories: (parentId?: string) =>
    apiRequest(() => apiClient.get<any[]>('/api/service-category', {
      params: { parentId }
    })),

  getCategory: (id: string) =>
    apiRequest(() => apiClient.get<any>(`/api/service-category/${id}`)),

  getCategoryTree: () =>
    apiRequest(() => apiClient.get<any[]>('/api/service-category/tree')),

  createCategory: (categoryData: any) =>
    apiRequest(() => apiClient.post<any>('/api/service-category', categoryData)),

  updateCategory: (id: string, categoryData: any) =>
    apiRequest(() => apiClient.put<any>(`/api/service-category/${id}`, categoryData)),

  deleteCategory: (id: string) =>
    apiRequest(() => apiClient.delete(`/api/service-category/${id}`)),
};

// Service Images API
export const serviceImagesApi = {
  getImages: (serviceId: string) =>
    apiRequest(() => apiClient.get<any[]>(`/api/service-image/service/${serviceId}`)),

  uploadImage: (serviceId: string, file: File, caption?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('serviceId', serviceId);
    if (caption) {
      formData.append('caption', caption);
    }
    return apiRequest(() => apiClient.post<any>('/api/service-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }));
  },

  deleteImage: (id: string) =>
    apiRequest(() => apiClient.delete(`/api/service-image/${id}`)),

  setAsPrimary: (id: string) =>
    apiRequest(() => apiClient.post(`/api/service-image/${id}/set-primary`)),
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

// File Upload API
export const fileUploadApi = {
  // General file upload endpoint
  uploadFile: (file: File, category?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (category) {
      formData.append('category', category);
    }
    return apiRequest(() => apiClient.post<FileUploadResponse>('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }));
  },

  // Secure authenticated upload
  uploadSecure: (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest(() => apiClient.post<FileUploadResponse>('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    }));
  },

  // Delete uploaded file
  deleteFile: (fileId: string) =>
    apiRequest(() => apiClient.delete(`/api/upload/${fileId}`)),
};

// Calendar/Scheduling API
export const calendarApi = {
  // Get calendar events
  getEvents: (startDate?: string, endDate?: string, providerId?: string, customerId?: string) =>
    apiRequest(() => apiClient.get('/api/calendar/events', {
      params: { startDate, endDate, providerId, customerId }
    })),

  // Create new calendar event
  createEvent: (eventData: any) =>
    apiRequest(() => apiClient.post('/api/calendar/events', eventData)),

  // Update existing event
  updateEvent: (eventId: string, eventData: any) =>
    apiRequest(() => apiClient.put(`/api/calendar/events/${eventId}`, eventData)),

  // Delete event
  deleteEvent: (eventId: string) =>
    apiRequest(() => apiClient.delete(`/api/calendar/events/${eventId}`)),

  // Get provider availability
  getAvailability: (providerId: string, startDate: string, endDate: string) =>
    apiRequest(() => apiClient.get(`/api/calendar/availability/${providerId}`, {
      params: { startDate, endDate }
    })),

  // Set provider availability
  setAvailability: (availabilityData: any) =>
    apiRequest(() => apiClient.post('/api/calendar/availability', availabilityData)),

  // Get bookings for a provider
  getProviderBookings: (providerId: string, startDate?: string, endDate?: string) =>
    apiRequest(() => apiClient.get(`/api/calendar/bookings/provider/${providerId}`, {
      params: { startDate, endDate }
    })),

  // Get bookings for a customer
  getCustomerBookings: (customerId: string, startDate?: string, endDate?: string) =>
    apiRequest(() => apiClient.get(`/api/calendar/bookings/customer/${customerId}`, {
      params: { startDate, endDate }
    })),
};

// Testing API for development/QA purposes
export const testingApi = {
  // Run test suites
  runTests: (suiteId?: string) =>
    apiRequest(() => apiClient.post('/api/testing/run', { suiteId })),

  // Get test results
  getTestResults: (runId?: string) =>
    apiRequest(() => apiClient.get('/api/testing/results', {
      params: { runId }
    })),

  // Get test suites
  getTestSuites: () =>
    apiRequest(() => apiClient.get('/api/testing/suites')),

  // Create or update test case
  saveTestCase: (testData: any) =>
    apiRequest(() => apiClient.post('/api/testing/cases', testData)),

  // Get code quality metrics
  getCodeQuality: () =>
    apiRequest(() => apiClient.get('/api/testing/code-quality')),

  // Get performance metrics
  getPerformanceMetrics: () =>
    apiRequest(() => apiClient.get('/api/testing/performance')),
};