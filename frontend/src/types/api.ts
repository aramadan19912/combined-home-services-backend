// ===== AUTHENTICATION TYPES =====
export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface GoogleLoginDto {
  idToken: string;
}

export interface LoginResultDto {
  token: string;
  refreshToken?: string;
  expiresIn: number;
  user: UserProfileDto;
  requiresTwoFactor: boolean;
  twoFactorProviders?: string[];
}

export interface JwtClaims {
  sub: string;
  email: string;
  jti: string;
  name: string;
  role?: string;
  exp?: number;
  iat?: number;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailDto {
  userId: string;
  token: string;
}

export interface VerifyPhoneDto {
  userId: string;
  code: string;
}

export interface TwoFactorSetupDto {
  provider: string;
  token: string;
}

// ===== USER MANAGEMENT DTOs =====
export interface UserProfileDto {
  id: string;
  name: string; // Keep for compatibility with JWT claims
  fullName: string;
  email: string;
  address?: string;
  phoneNumber?: string;
  profileImage?: string;
  userType: 'Customer' | 'Provider' | 'Admin';
  role: 'customer' | 'provider' | 'admin'; // Add role property
  isVerified: boolean;
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  lastLoginAt?: string;
  failedLoginAttempts: number;
  accountLockedUntil?: string;
  twoFactorEnabled: boolean;
  preferredLanguage?: string;
  timeZone?: string;
}

export interface UpdateUserProfileDto {
  fullName?: string;
  address?: string;
  phoneNumber?: string;
  profileImage?: string;
  preferredLanguage?: string;
  timeZone?: string;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  userType: 'Customer' | 'Provider';
  address?: string;
}

// ===== ORDER MANAGEMENT DTOs =====
export interface CreateUpdateOrderDto {
  serviceId: string;
  scheduledDate: string;
  scheduledTime?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  specialInstructions?: string;
  couponCode?: string;
  addOns?: CreateOrderAddOnDto[];
  reminderEnabled?: boolean;
  reminders?: CreateOrderReminderDto[];
  isRecurring?: boolean;
  recurrenceType?: 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
  preferredPaymentMethod?: string;
  autoPayForRecurring?: boolean;
}

export interface CreateOrderAddOnDto {
  addOnId: string;
  quantity: number;
}

export interface CreateOrderReminderDto {
  type: 'Email' | 'SMS' | 'Push';
  hoursBefore: number;
}

export interface OrderDto {
  id: string;
  serviceId: string;
  serviceName: string;
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  status: 'Pending' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  scheduledDate: string;
  scheduledTime?: string;
  completedAt?: string;
  totalAmount: number;
  address: string;
  latitude?: number;
  longitude?: number;
  specialInstructions?: string;
  couponCode?: string;
  discountAmount?: number;
  addOns: OrderAddOnDto[];
  reminders: OrderReminderDto[];
  isRecurring: boolean;
  recurrenceType: string;
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderAddOnDto {
  id: string;
  addOnId: string;
  addOnName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface OrderReminderDto {
  id: string;
  type: string;
  hoursBefore: number;
  sentAt?: string;
  isActive: boolean;
}

export interface OrderSearchDto {
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  serviceId?: string;
  providerId?: string;
  userId?: string;
  searchTerm?: string;
  isRecurring?: boolean;
  minAmount?: number;
  maxAmount?: number;
  maxResultCount?: number;
  skipCount?: number;
  sorting?: string;
}

export interface OrderStatusHistoryDto {
  id: string;
  status: string;
  notes?: string;
  changedAt: string;
  changedBy: string;
  changedByName: string;
}

export interface UpdateOrderStatusDto {
  status: 'Pending' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface CancelOrderDto {
  reason: string;
  refundRequested?: boolean;
}

// ===== SERVICE MANAGEMENT DTOs =====
export interface ServiceDto {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  minPrice?: number;
  maxPrice?: number;
  isActive: boolean;
  providerId?: string;
  providerName?: string;
  averageRating: number;
  reviewCount: number;
  duration: number;
  durationUnit: 'Minutes' | 'Hours' | 'Days';
  images: string[];
  tags: string[];
  isAvailable: boolean;
  serviceArea?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  availability: ServiceAvailabilityDto[];
  addOns: ServiceAddOnDto[];
  cancellationPolicy?: string;
  bookingLeadTime: number;
  instantBooking: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceAvailabilityDto {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface ServiceAddOnDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  isRequired: boolean;
}

export interface CreateUpdateServiceDto {
  name: string;
  description: string;
  category: string;
  price: number;
  minPrice?: number;
  maxPrice?: number;
  duration: number;
  durationUnit: string;
  images?: string[];
  tags?: string[];
  serviceArea?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  availability?: CreateServiceAvailabilityDto[];
  addOns?: CreateServiceAddOnDto[];
  cancellationPolicy?: string;
  bookingLeadTime: number;
  instantBooking: boolean;
}

export interface CreateServiceAvailabilityDto {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface CreateServiceAddOnDto {
  name: string;
  description?: string;
  price: number;
  isRequired: boolean;
}

export interface ServiceSearchDto {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  providerId?: string;
  location?: string;
  radius?: number;
  sortBy?: 'Price' | 'Rating' | 'Distance' | 'Popularity';
  maxResultCount?: number;
  skipCount?: number;
}

export interface ServiceCategoryDto {
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  serviceCount: number;
  isActive: boolean;
}

export interface ServiceSuggestionDto {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
}

// ===== PROVIDER MANAGEMENT DTOs =====
export interface ProviderDto {
  id: string;
  userId: string;
  userName: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  serviceCategories: string[];
  bio?: string;
  averageRating: number;
  totalOrders: number;
  completedOrders: number;
  isAvailable: boolean;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvedAt?: string;
  rejectionReason?: string;
  idAttachmentPath?: string;
  crAttachmentPath?: string;
  businessLicenseAttachmentPath?: string;
  insuranceCertificatePath?: string;
  taxIdNumber?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  serviceArea?: string;
  walletBalance: number;
  profileImages: string[];
  businessImages: string[];
  certifications: ProviderCertificationDto[];
  availability: ProviderAvailabilityDto[];
  bankInfo?: ProviderBankInfoDto;
  references: ProviderReferenceDto[];
  verification: ProviderVerificationDto;
  createdAt: string;
  lastActiveAt?: string;
  backgroundCheckCompleted: boolean;
  backgroundCheckDate?: string;
  backgroundCheckStatus?: string;
}

export interface ProviderCertificationDto {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  certificateNumber: string;
  attachmentPath?: string;
  isVerified: boolean;
}

export interface ProviderAvailabilityDto {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface ProviderBankInfoDto {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  isVerified: boolean;
}

export interface ProviderReferenceDto {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  relationship: string;
  company?: string;
  isContacted: boolean;
  contactedAt?: string;
  notes?: string;
}

export interface ProviderVerificationDto {
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  businessLicenseVerified: boolean;
  insuranceVerified: boolean;
  backgroundCheckPassed: boolean;
  referencesVerified: boolean;
  verificationScore: number;
  pendingVerifications: string[];
}

export interface ProviderEarningsDto {
  date: string;
  amount: number;
  orderCount: number;
  period: string;
}

export interface ProviderStatsDto {
  totalEarnings: number;
  monthlyEarnings: number;
  totalOrders: number;
  completedOrders: number;
  averageRating: number;
  responseTime: number;
  completionRate: number;
}

export interface UpdateProviderDto {
  specialization?: string;
  serviceCategories?: string[];
  bio?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  serviceArea?: string;
  isAvailable?: boolean;
  certifications?: CreateProviderCertificationDto[];
  availability?: CreateProviderAvailabilityDto[];
  bankInfo?: CreateProviderBankInfoDto;
  references?: CreateProviderReferenceDto[];
}

export interface CreateProviderCertificationDto {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  certificateNumber: string;
  attachmentPath?: string;
}

export interface CreateProviderAvailabilityDto {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface CreateProviderBankInfoDto {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
}

export interface CreateProviderReferenceDto {
  name: string;
  email: string;
  phoneNumber: string;
  relationship: string;
  company?: string;
}

export interface ProviderSearchDto {
  query?: string;
  category?: string;
  location?: string;
  radius?: number;
  minRating?: number;
  isAvailable?: boolean;
  approvalStatus?: string;
}

export interface BulkRejectDto {
  ids: string[];
  reason: string;
}

// ===== PAYMENT MANAGEMENT DTOs =====
export interface PaymentRequestDto {
  orderId: string;
  amount: number;
  providerType: 'ApplePay' | 'AlRajhi' | 'Fawry' | 'NBEgypt';
}

export interface PaymentTransactionDto {
  id: string;
  orderId: string;
  amount: number;
  providerType: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded' | 'PartiallyRefunded';
  transactionId?: string;
  providerTransactionId?: string;
  paymentMethod?: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  refundedAmount?: number;
  refundReason?: string;
}

export interface OrderPaymentStatusDto {
  orderId: string;
  status: 'Pending' | 'Paid' | 'Failed' | 'Refunded' | 'PartiallyRefunded';
  totalAmount: number;
  paidAmount: number;
  refundedAmount: number;
  transactions: PaymentTransactionDto[];
  lastTransactionAt?: string;
}

export interface UserPaymentMethodDto {
  id: string;
  type: 'Card' | 'BankAccount' | 'DigitalWallet';
  displayName: string;
  lastFourDigits?: string;
  expiryDate?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateUpdateUserPaymentMethodDto {
  type: 'Card' | 'BankAccount' | 'DigitalWallet';
  displayName: string;
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  accountNumber?: string;
  routingNumber?: string;
  walletId?: string;
  isDefault?: boolean;
}

export interface RefundPartialDto {
  amount: number;
  reason?: string;
}

// ===== REVIEW MANAGEMENT DTOs =====
export interface ReviewDto {
  id: string;
  serviceId?: string;
  serviceName?: string;
  orderId?: string;
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  rating: number;
  comment?: string;
  images?: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUpdateReviewDto {
  serviceId?: string;
  orderId?: string;
  rating: number;
  comment?: string;
  images?: string[];
}

// ===== COMPLAINT MANAGEMENT DTOs =====
export interface ComplaintDto {
  id: string;
  orderId?: string;
  providerId?: string;
  customerId: string;
  customerName: string;
  subject: string;
  description: string;
  status: 'Open' | 'InProgress' | 'Resolved' | 'Closed' | 'Escalated';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
  attachments: string[];
  assignedTo?: string;
  assignedToName?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CreateComplaintDto {
  orderId?: string;
  providerId?: string;
  subject: string;
  description: string;
  category: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  attachments?: string[];
}

export interface AdminReplyDto {
  message: string;
  isInternal?: boolean;
  attachments?: string[];
}

export interface AuditLogDto {
  id: string;
  complaintId: string;
  action: string;
  performedBy: string;
  performedByName: string;
  details?: string;
  oldValue?: string;
  newValue?: string;
  performedAt: string;
}

// ===== NOTIFICATION DTOs =====
export interface NotificationLogDto {
  id: string;
  userId: string;
  type: 'Email' | 'SMS' | 'Push' | 'InApp';
  title: string;
  message: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
  metadata?: Record<string, any>;
}

export interface TestNotificationDto {
  userId: string;
  type: 'Email' | 'SMS' | 'Push' | 'InApp';
  title: string;
  message: string;
}

export interface NotificationContentDto {
  title: string;
  message: string;
  type: 'Info' | 'Success' | 'Warning' | 'Error';
  metadata?: Record<string, any>;
}

// ===== ANALYTICS & REPORTING DTOs =====
export interface DashboardAnalyticsDto {
  userAnalytics: UserAnalyticsDto;
  orderAnalytics: OrderAnalyticsDto;
  revenueAnalytics: RevenueAnalyticsDto;
  serviceAnalytics: ServiceAnalyticsDto;
  providerAnalytics: ProviderAnalyticsDto;
  charts: ChartDataDto[];
}

export interface UserAnalyticsDto {
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsersThisMonth: number;
  userRetentionRate: number;
  customerSatisfactionScore: number;
  userGrowthData: UserGrowthDto[];
}

export interface OrderAnalyticsDto {
  totalOrders: number;
  ordersThisMonth: number;
  completedOrders: number;
  cancelledOrders: number;
  orderCompletionRate: number;
  averageOrderValue: number;
  orderTrends: OrderTrendDto[];
}

export interface RevenueAnalyticsDto {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueGrowthRate: number;
  averageRevenuePerUser: number;
  revenueBreakdown: RevenueBreakdownDto[];
}

export interface ServiceAnalyticsDto {
  totalServices: number;
  activeServices: number;
  popularServices: PopularServiceDto[];
  categoryPerformance: ServiceCategoryPerformanceDto[];
}

export interface ProviderAnalyticsDto {
  totalProviders: number;
  activeProviders: number;
  pendingApprovals: number;
  averageProviderRating: number;
  topProviders: TopProviderDto[];
}

export interface ChartDataDto {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'doughnut';
  title: string;
  labels: string[];
  datasets: ChartDatasetDto[];
}

export interface ChartDatasetDto {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
}

export interface KpiDto {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
}

export interface UserGrowthDto {
  date: string;
  newUsers: number;
  totalUsers: number;
}

export interface OrderTrendDto {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface RevenueBreakdownDto {
  category: string;
  amount: number;
  percentage: number;
}

export interface PopularServiceDto {
  serviceId: string;
  serviceName: string;
  category: string;
  orderCount: number;
  revenue: number;
  averageRating: number;
}

export interface ServiceCategoryPerformanceDto {
  category: string;
  serviceCount: number;
  orderCount: number;
  revenue: number;
  averageRating: number;
}

export interface TopProviderDto {
  providerId: string;
  providerName: string;
  orderCount: number;
  revenue: number;
  averageRating: number;
  reviewCount: number;
}

export interface AnalyticsFilterDto {
  startDate?: string;
  endDate?: string;
  category?: string;
  providerId?: string;
  metricType?: string;
  groupBy?: 'day' | 'week' | 'month' | 'year';
}

export interface RealTimeMetricsDto {
  activeUsers: number;
  onlineProviders: number;
  pendingOrders: number;
  ordersToday: number;
  revenueToday: number;
  lastUpdated: string;
}

// ===== DASHBOARD DTOs =====
export interface CustomerDashboardDto {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  favoriteServices: ServiceDto[];
  recentBookings: OrderDto[];
  pendingReviews: number;
  loyaltyPoints: number;
  totalSpent: number;
}

export interface ProviderDashboardDto {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingRequests: number;
  todaysSchedule: OrderDto[];
  recentReviews: ReviewDto[];
  averageRating: number;
  completionRate: number;
  responseTime: number;
}

export interface AdminDashboardDto {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeComplaints: number;
  systemHealth: string;
  recentRegistrations: UserProfileDto[];
  topServices: PopularServiceDto[];
}

// ===== UTILITY DTOs =====
export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: string;
    validationErrors?: ValidationError[];
  };
}

// ===== EXISTING TYPES (KEEP FOR COMPATIBILITY) =====
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'provider' | 'admin';
  phone: string;
  createdAt: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

// Service types
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  provider: string;
  rating: number;
  image: string;
}

export interface Order {
  id: string;
  serviceId: string;
  serviceName: string;
  customerId: string;
  providerId: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  totalAmount: number;
  createdAt: string;
}

export interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  rating: number;
  totalJobs: number;
  isAvailable: boolean;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: string;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  orderId: string;
  customerId: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface Analytics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeProviders: number;
  averageRating: number;
  topServices: Service[];
  recentOrders: Order[];
}

// Alias for compatibility
export type CreateReviewDto = CreateUpdateReviewDto;
export type PaymentTransaction = PaymentTransactionDto;
export type Category = ServiceCategoryDto;
export type PaymentMethod = UserPaymentMethodDto;
export type FileUploadResponse = { 
  id?: string; 
  fileId?: string; 
  url?: string; 
  fileUrl?: string; 
  fileName?: string; 
  path?: string; 
};
export type HealthMetrics = { status: string; uptime: number };
export type PerformanceMetrics = { cpuUsage: number; memoryUsage: number };

// Calendar and Testing API Types
export interface CalendarEventDto {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'booking' | 'availability' | 'blocked';
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  customerId?: string;
  providerId?: string;
  serviceId?: string;
  notes?: string;
}

export interface TestNotificationDto {
  fcmToken: string;
  title: string;
  body: string;
}

export interface NotificationContentDto {
  title: string;
  body: string;
}
