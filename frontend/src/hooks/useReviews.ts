import { useState, useEffect, useCallback } from 'react';
import { reviewsApi } from '@/services/api';
import { Review, CreateReviewDto } from '@/types/api';

export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  photos?: FileList;
}

export interface ReviewFilters {
  rating?: number;
  verified?: boolean;
  sortBy?: 'newest' | 'oldest' | 'rating' | 'helpful';
}

export interface UseReviewsProps {
  providerId?: string;
  orderId?: string;
  initialFilters?: ReviewFilters;
}

export function useReviews({ providerId, orderId, initialFilters }: UseReviewsProps = {}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load reviews from API
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let reviewData: Review[] = [];
      
      if (orderId) {
        // Get reviews by order
        reviewData = await reviewsApi.getReviewsByOrder(orderId);
      } else if (providerId) {
        // Get reviews by provider
        reviewData = await reviewsApi.getReviewsByProvider(providerId);
      } else {
        // If no specific filter, you might want to implement a general getReviews endpoint
        console.warn('No orderId or providerId provided for reviews');
        reviewData = [];
      }
      
      setReviews(reviewData);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
      setReviews([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  }, [orderId, providerId]);

  // Load reviews on mount and when dependencies change
  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Apply filters to reviews
  const filteredReviews = reviews.filter(review => {
    if (initialFilters?.rating && review.rating !== initialFilters.rating) {
      return false;
    }
    // Add more filter logic as needed
    return true;
  });

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (initialFilters?.sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'rating':
        return b.rating - a.rating;
      case 'helpful':
        // Assuming helpful count is available in metadata
        return (b.metadata?.helpful || 0) - (a.metadata?.helpful || 0);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Submit a new review
  const submitReview = async (formData: ReviewFormData): Promise<boolean> => {
    if (!orderId && !providerId) {
      setError('Order ID or Provider ID is required to submit a review');
      return false;
    }

    try {
      setSubmitting(true);
      setError(null);

      const reviewData: CreateReviewDto = {
        rating: formData.rating,
        comment: formData.comment,
        orderId: orderId,
        // Note: You might need to implement photo upload separately
        // images: await uploadPhotos(formData.photos)
      };

      const newReview = await reviewsApi.createReview(reviewData);
      
      // Add the new review to the current list
      setReviews(prev => [newReview, ...prev]);
      
      return true;
    } catch (err) {
      console.error('Failed to submit review:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit review');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate stats
  const stats = {
    total: sortedReviews.length,
    averageRating: sortedReviews.length > 0 
      ? sortedReviews.reduce((sum, review) => sum + review.rating, 0) / sortedReviews.length 
      : 0,
    distribution: {
      5: sortedReviews.filter(r => r.rating === 5).length,
      4: sortedReviews.filter(r => r.rating === 4).length,
      3: sortedReviews.filter(r => r.rating === 3).length,
      2: sortedReviews.filter(r => r.rating === 2).length,
      1: sortedReviews.filter(r => r.rating === 1).length,
    },
  };

  return {
    reviews: sortedReviews,
    loading,
    error,
    submitting,
    stats,
    submitReview,
    refreshReviews: loadReviews,
  };
}