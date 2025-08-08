import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface Review {
  id: string;
  userId: string;
  providerId: string;
  bookingId: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
  helpful: number;
  notHelpful: number;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  provider: {
    name: string;
    service: string;
  };
  photos?: string[];
}

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string) => void;
  onNotHelpful?: (reviewId: string) => void;
  onReply?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  showProvider?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onHelpful,
  onNotHelpful,
  onReply,
  onReport,
  showProvider = false,
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.user.avatar} alt={review.user.name} />
              <AvatarFallback>{review.user.initials}</AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{review.user.name}</h4>
                {review.verified && (
                  <Badge variant="secondary" className="text-xs">
                    Verified
                  </Badge>
                )}
              </div>
              
              {showProvider && (
                <p className="text-sm text-muted-foreground">
                  {review.provider.service} by {review.provider.name}
                </p>
              )}
              
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(review.createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReport?.(review.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Rating and Title */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {renderStars(review.rating)}
            </div>
            <span className={`font-medium ${getRatingColor(review.rating)}`}>
              {review.rating}/5
            </span>
          </div>
          
          {review.title && (
            <h3 className="font-semibold text-lg">{review.title}</h3>
          )}
        </div>
        
        {/* Comment */}
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {review.comment}
        </p>
        
        {/* Photos */}
        {review.photos && review.photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {review.photos.slice(0, 4).map((photo, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src={photo}
                  alt={`Review photo ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                />
              </div>
            ))}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onHelpful?.(review.id)}
              className="text-muted-foreground hover:text-green-600"
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Helpful ({review.helpful})
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNotHelpful?.(review.id)}
              className="text-muted-foreground hover:text-red-600"
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              ({review.notHelpful})
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply?.(review.id)}
            className="text-muted-foreground"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Reply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;