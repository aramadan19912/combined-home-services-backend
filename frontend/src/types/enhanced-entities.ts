/**
 * Enhanced TypeScript types matching new backend entities
 * Synced with backend domain models
 */

import { Currency, Country } from '@/utils/currency';

// ============================================
// Order Enhancements
// ============================================

export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Accepted = 'Accepted',
  EnRoute = 'EnRoute',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Disputed = 'Disputed'
}

export interface EnhancedOrder {
  id: string;
  serviceId: string;
  userId: string;
  providerId?: string;
  status: OrderStatus;
  scheduledDate: Date;
  address: string;

  // Location tracking
  latitude?: number;
  longitude?: number;
  specialInstructions?: string;

  // Regional & Currency
  country: Country;
  currency: Currency;

  // Price breakdown
  basePrice: number;
  taxAmount: number;
  taxRate: number;
  platformFee: number;
  discountAmount: number;
  totalPrice: number;

  // Payment
  paymentStatus: PaymentStatus;
  paidAmount: number;
  remainingAmount: number;
  isFullyPaid: boolean;

  // Tracking timestamps
  estimatedArrivalTime?: Date;
  actualArrivalTime?: Date;
  completionTime?: Date;

  // Recurring
  isRecurring: boolean;
  recurrenceType?: 'None' | 'Weekly' | 'Monthly';
  recurrenceInterval?: number;
  recurrenceEndDate?: Date;

  cancellationReason?: string;
  reminderEnabled: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentStatus {
  Unpaid = 'Unpaid',
  Partial = 'Partial',
  Paid = 'Paid',
  Refunded = 'Refunded'
}

// ============================================
// Service Enhancements
// ============================================

export interface EnhancedService {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: Currency;
  country?: Country;
  isActive: boolean;
  isFeatured: boolean;
  providerId?: string;
  estimatedDuration?: number; // in minutes
  imageUrls?: string; // comma-separated
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Service Category
// ============================================

export interface ServiceCategory {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  nameFr?: string;
  description: string;
  descriptionAr: string;
  descriptionEn: string;
  descriptionFr?: string;
  parentCategoryId?: string;
  iconUrl?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  country?: Country;
  tags?: string; // comma-separated
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Service Image Gallery
// ============================================

export interface ServiceImage {
  id: string;
  serviceId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  displayOrder: number;
  isPrimary: boolean;
  caption?: string;
  altText?: string;
  createdAt: Date;
}

// ============================================
// Provider Location Tracking
// ============================================

export interface ProviderLocation {
  id: string;
  providerId: string;
  orderId?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
  isOnline: boolean;
}

// ============================================
// Chat/Messaging
// ============================================

export enum ChatMessageType {
  Text = 'Text',
  Image = 'Image',
  Voice = 'Voice',
  Location = 'Location'
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageType: ChatMessageType;
  attachmentUrl?: string;
  thumbnailUrl?: string;
  isRead: boolean;
  readAt?: Date;
  deliveredAt?: Date;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
}

// ============================================
// Enhanced Reviews
// ============================================

export enum ReviewStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Flagged = 'Flagged'
}

export interface EnhancedReview {
  id: string;
  orderId: string;
  userId: string;
  providerId?: string;
  serviceId?: string;

  // Detailed ratings
  rating: number; // Overall 1-5
  serviceQualityRating?: number;
  professionalismRating?: number;
  punctualityRating?: number;
  valueRating?: number;

  comment: string;
  imageUrls?: string; // comma-separated

  // Moderation
  status: ReviewStatus;
  isVerified: boolean;
  isAnonymous: boolean;

  // Provider response
  providerResponse?: string;
  providerResponseDate?: Date;

  // Helpfulness
  helpfulCount: number;
  notHelpfulCount: number;

  // Moderation
  moderationNotes?: string;
  moderatedAt?: Date;
  moderatedBy?: string;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Invoice
// ============================================

export enum InvoiceStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  PartiallyPaid = 'PartiallyPaid',
  Paid = 'Paid',
  Overdue = 'Overdue',
  Void = 'Void'
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  userId: string;
  providerId?: string;

  invoiceDate: Date;
  dueDate?: Date;

  // Regional
  country: Country;
  currency: Currency;

  // Pricing
  itemDescription: string;
  subTotal: number;
  taxRate: number;
  taxAmount: number;
  platformFee: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;

  // Status
  status: InvoiceStatus;

  // Customer details
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerTaxId?: string;

  // Provider details
  providerName: string;
  providerTaxId?: string;
  providerAddress: string;

  // Files
  pdfPath?: string;
  digitalSignature?: string;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// API Request/Response Types
// ============================================

export interface PriceBreakdownRequest {
  basePrice: number;
  country: Country;
  discount?: number;
  platformFee?: number;
}

export interface PriceBreakdownResponse {
  basePrice: number;
  taxAmount: number;
  taxRate: number;
  platformFee: number;
  discount: number;
  total: number;
  currency: Currency;
  currencySymbol: string;
}

export interface TrackingUpdate {
  providerId: string;
  orderId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

export interface SendMessageRequest {
  orderId: string;
  receiverId: string;
  message: string;
  messageType: ChatMessageType;
  attachmentUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface SubmitReviewRequest {
  orderId: string;
  providerId: string;
  serviceId: string;
  rating: number;
  serviceQualityRating?: number;
  professionalismRating?: number;
  punctualityRating?: number;
  valueRating?: number;
  comment: string;
  imageUrls?: string[];
  isAnonymous?: boolean;
}

export interface GenerateInvoiceRequest {
  orderId: string;
}

export interface DownloadInvoiceRequest {
  invoiceId: string;
  format: 'pdf' | 'json';
}
