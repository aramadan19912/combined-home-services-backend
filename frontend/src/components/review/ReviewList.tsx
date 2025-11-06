/**
 * ReviewList Component
 * Display list of reviews with filtering, sorting, and pagination
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Filter, TrendingUp, Calendar, ThumbsUp } from 'lucide-react';
import { EnhancedReview, ReviewStatus } from '@/types/enhanced-entities';
import { ReviewDisplay } from './ReviewDisplay';

export interface ReviewListProps {
  reviews: EnhancedReview[];
  providerId?: string;
  serviceId?: string;
  onMarkHelpful?: (reviewId: string) => Promise<void>;
  onMarkNotHelpful?: (reviewId: string) => Promise<void>;
  onReport?: (reviewId: string, reason: string) => Promise<void>;
  showFilters?: boolean;
  showProviderResponse?: boolean;
  initialPageSize?: number;
  className?: string;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
type FilterRating = 'all' | '5' | '4' | '3' | '2' | '1';

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  providerId,
  serviceId,
  onMarkHelpful,
  onMarkNotHelpful,
  onReport,
  showFilters = true,
  showProviderResponse = true,
  initialPageSize = 10,
  className = '',
}) => {
  const { t } = useTranslation();

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterRating, setFilterRating] = useState<FilterRating>('all');
  const [filterVerified, setFilterVerified] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(initialPageSize);

  // Calculate statistics
  const stats = useMemo(() => {
    const approvedReviews = reviews.filter(
      (r) => r.status === ReviewStatus.Approved
    );

    if (approvedReviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        verifiedCount: 0,
        withPhotosCount: 0,
      };
    }

    const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / approvedReviews.length;

    const ratingDistribution = approvedReviews.reduce(
      (dist, r) => {
        const rating = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
        dist[rating] = (dist[rating] || 0) + 1;
        return dist;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    );

    const verifiedCount = approvedReviews.filter((r) => r.isVerified).length;
    const withPhotosCount = approvedReviews.filter(
      (r) => r.imageUrls && r.imageUrls.length > 0
    ).length;

    return {
      averageRating,
      totalReviews: approvedReviews.length,
      ratingDistribution,
      verifiedCount,
      withPhotosCount,
    };
  }, [reviews]);

  // Filter and sort reviews
  const processedReviews = useMemo(() => {
    let filtered = reviews.filter((r) => r.status === ReviewStatus.Approved);

    // Filter by rating
    if (filterRating !== 'all') {
      const targetRating = parseInt(filterRating);
      filtered = filtered.filter((r) => Math.round(r.rating) === targetRating);
    }

    // Filter by verified
    if (filterVerified) {
      filtered = filtered.filter((r) => r.isVerified);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return (b.helpfulCount || 0) - (a.helpfulCount || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [reviews, sortBy, filterRating, filterVerified]);

  // Pagination
  const totalPages = Math.ceil(processedReviews.length / pageSize);
  const paginatedReviews = processedReviews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const renderRatingBar = (rating: number, count: number) => {
    const percentage =
      stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

    return (
      <button
        onClick={() =>
          setFilterRating(filterRating === rating.toString() ? 'all' : rating.toString() as FilterRating)
        }
        className={`flex items-center gap-2 w-full hover:bg-muted/50 p-2 rounded transition ${
          filterRating === rating.toString() ? 'bg-muted' : ''
        }`}
      >
        <div className="flex items-center gap-1 w-16">
          <span className="text-sm font-medium">{rating}</span>
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        </div>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground w-12 text-right">
          {count}
        </span>
      </button>
    );
  };

  if (reviews.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('review.noReviews')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('review.noReviewsDescription')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('review.customerReviews')}</span>
            <Badge variant="secondary" className="text-lg px-3">
              {stats.totalReviews} {t('review.reviews')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg">
              <div className="text-5xl font-bold mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(stats.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('review.basedOn', { count: stats.totalReviews })}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) =>
                renderRatingBar(rating, stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution])
              )}
            </div>
          </div>

          {/* Additional Stats */}
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t">
            <Badge variant="outline" className="gap-2">
              <Star className="h-4 w-4" />
              {stats.verifiedCount} {t('review.verifiedPurchases')}
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Star className="h-4 w-4" />
              {stats.withPhotosCount} {t('review.withPhotos')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sorting */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {t('review.sort.newest')}
                      </div>
                    </SelectItem>
                    <SelectItem value="oldest">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {t('review.sort.oldest')}
                      </div>
                    </SelectItem>
                    <SelectItem value="highest">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        {t('review.sort.highest')}
                      </div>
                    </SelectItem>
                    <SelectItem value="lowest">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        {t('review.sort.lowest')}
                      </div>
                    </SelectItem>
                    <SelectItem value="helpful">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        {t('review.sort.helpful')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verified Filter */}
              <Button
                variant={filterVerified ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterVerified(!filterVerified)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {t('review.verifiedOnly')}
              </Button>

              {/* Clear Filters */}
              {(filterRating !== 'all' || filterVerified) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterRating('all');
                    setFilterVerified(false);
                  }}
                >
                  {t('review.clearFilters')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {paginatedReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('review.noMatchingReviews')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('review.tryDifferentFilters')}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setFilterRating('all');
                  setFilterVerified(false);
                }}
              >
                {t('review.clearFilters')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          paginatedReviews.map((review) => (
            <ReviewDisplay
              key={review.id}
              review={review}
              onMarkHelpful={onMarkHelpful}
              onMarkNotHelpful={onMarkNotHelpful}
              onReport={onReport}
              showProviderResponse={showProviderResponse}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t('review.showing', {
                  start: (currentPage - 1) * pageSize + 1,
                  end: Math.min(currentPage * pageSize, processedReviews.length),
                  total: processedReviews.length,
                })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  {t('common.previous')}
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReviewList;
