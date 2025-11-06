/**
 * ReviewDisplay Component
 * Display individual review with all details, ratings, and provider response
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Shield,
  Flag,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from 'lucide-react';
import { EnhancedReview, ReviewStatus } from '@/types/enhanced-entities';
import { format } from 'date-fns';
import { toast } from 'sonner';

export interface ReviewDisplayProps {
  review: EnhancedReview;
  onMarkHelpful?: (reviewId: string) => Promise<void>;
  onMarkNotHelpful?: (reviewId: string) => Promise<void>;
  onReport?: (reviewId: string, reason: string) => Promise<void>;
  showProviderResponse?: boolean;
  className?: string;
}

export const ReviewDisplay: React.FC<ReviewDisplayProps> = ({
  review,
  onMarkHelpful,
  onMarkNotHelpful,
  onReport,
  showProviderResponse = true,
  className = '',
}) => {
  const { t } = useTranslation();
  const [showAllImages, setShowAllImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDetailedRatings, setShowDetailedRatings] = useState(false);

  const imageUrls = review.imageUrls ? review.imageUrls.split(',') : [];
  const displayImages = showAllImages ? imageUrls : imageUrls.slice(0, 3);

  const handleMarkHelpful = async () => {
    if (!onMarkHelpful) return;
    try {
      await onMarkHelpful(review.id);
      toast.success(t('review.markedHelpful'));
    } catch (error) {
      toast.error(t('review.actionFailed'));
    }
  };

  const handleMarkNotHelpful = async () => {
    if (!onMarkNotHelpful) return;
    try {
      await onMarkNotHelpful(review.id);
      toast.success(t('review.markedNotHelpful'));
    } catch (error) {
      toast.error(t('review.actionFailed'));
    }
  };

  const handleReport = async () => {
    if (!onReport) return;
    // In a real app, this would open a dialog to collect report reason
    try {
      await onReport(review.id, 'inappropriate_content');
      toast.success(t('review.reportSubmitted'));
    } catch (error) {
      toast.error(t('review.actionFailed'));
    }
  };

  const getStatusBadge = () => {
    switch (review.status) {
      case ReviewStatus.Approved:
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {t('review.status.approved')}
          </Badge>
        );
      case ReviewStatus.Pending:
        return (
          <Badge variant="secondary" className="gap-1">
            {t('review.status.pending')}
          </Badge>
        );
      case ReviewStatus.Rejected:
        return (
          <Badge variant="destructive" className="gap-1">
            {t('review.status.rejected')}
          </Badge>
        );
      case ReviewStatus.Flagged:
        return (
          <Badge variant="outline" className="gap-1 border-orange-500 text-orange-500">
            <Flag className="h-3 w-3" />
            {t('review.status.flagged')}
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderStarRating = (rating: number, label?: string) => {
    return (
      <div className="flex items-center gap-1">
        {label && <span className="text-xs text-muted-foreground w-32">{label}:</span>}
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-muted-foreground ml-1">
          {rating}/5
        </span>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            {!review.isAnonymous ? (
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {review.userId.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-muted">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            )}

            <div className="flex-1">
              {/* Name and Badges */}
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">
                  {review.isAnonymous ? t('review.anonymousUser') : review.userId}
                </span>
                {review.isVerified && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <CheckCircle2 className="h-3 w-3" />
                    {t('review.verified')}
                  </Badge>
                )}
                {getStatusBadge()}
              </div>

              {/* Date */}
              <p className="text-xs text-muted-foreground">
                {format(new Date(review.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          {/* Report Button */}
          {onReport && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReport}
              className="h-8 w-8"
            >
              <Flag className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Overall Rating */}
        <div className="mb-3">
          {renderStarRating(review.rating)}
        </div>

        {/* Detailed Ratings Toggle */}
        {(review.serviceQualityRating ||
          review.professionalismRating ||
          review.punctualityRating ||
          review.valueRating) && (
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetailedRatings(!showDetailedRatings)}
              className="h-7 text-xs px-2"
            >
              {showDetailedRatings ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  {t('review.hideDetails')}
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  {t('review.showDetails')}
                </>
              )}
            </Button>

            {showDetailedRatings && (
              <div className="mt-2 space-y-2 bg-muted/30 p-3 rounded-lg">
                {review.serviceQualityRating &&
                  renderStarRating(
                    review.serviceQualityRating,
                    t('review.serviceQuality')
                  )}
                {review.professionalismRating &&
                  renderStarRating(
                    review.professionalismRating,
                    t('review.professionalism')
                  )}
                {review.punctualityRating &&
                  renderStarRating(
                    review.punctualityRating,
                    t('review.punctuality')
                  )}
                {review.valueRating &&
                  renderStarRating(review.valueRating, t('review.valueForMoney'))}
              </div>
            )}
          </div>
        )}

        {/* Comment */}
        <p className="text-sm mb-4 whitespace-pre-wrap">{review.comment}</p>

        {/* Images */}
        {imageUrls.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-2">
              {displayImages.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(url)}
                  className="relative aspect-square rounded-lg overflow-hidden border hover:opacity-90 transition"
                >
                  <img
                    src={url}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}

              {/* Show More Button */}
              {imageUrls.length > 3 && !showAllImages && (
                <button
                  onClick={() => setShowAllImages(true)}
                  className="aspect-square rounded-lg border border-dashed flex flex-col items-center justify-center hover:bg-muted/50 transition"
                >
                  <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">
                    +{imageUrls.length - 3} {t('review.morePhotos')}
                  </span>
                </button>
              )}
            </div>

            {showAllImages && imageUrls.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllImages(false)}
                className="mt-2 h-7 text-xs"
              >
                {t('review.showLess')}
              </Button>
            )}
          </div>
        )}

        {/* Provider Response */}
        {showProviderResponse && review.providerResponse && (
          <>
            <Separator className="my-4" />
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">
                  {t('review.providerResponse')}
                </span>
                {review.providerResponseDate && (
                  <span className="text-xs text-muted-foreground">
                    · {format(new Date(review.providerResponseDate), 'MMM dd, yyyy')}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {review.providerResponse}
              </p>
            </div>
          </>
        )}

        {/* Helpfulness */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {t('review.wasThisHelpful')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onMarkHelpful && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkHelpful}
                className="h-8 gap-1"
              >
                <ThumbsUp className="h-3 w-3" />
                <span className="text-xs">{review.helpfulCount || 0}</span>
              </Button>
            )}
            {onMarkNotHelpful && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkNotHelpful}
                className="h-8 gap-1"
              >
                <ThumbsDown className="h-3 w-3" />
                <span className="text-xs">{review.notHelpfulCount || 0}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Moderation Notes (only visible to admins/moderators) */}
        {review.moderationNotes && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-xs font-semibold text-orange-800 mb-1">
              {t('review.moderationNotes')}:
            </p>
            <p className="text-xs text-orange-700">{review.moderationNotes}</p>
          </div>
        )}
      </CardContent>

      {/* Image Modal/Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </Card>
  );
};

export default ReviewDisplay;
