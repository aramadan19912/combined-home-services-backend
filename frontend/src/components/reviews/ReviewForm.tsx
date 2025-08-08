import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormProps {
  bookingId: string;
  providerId: string;
  onSubmit: (review: {
    rating: number;
    title: string;
    comment: string;
    photos: File[];
  }) => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  bookingId,
  providerId,
  onSubmit,
  onCancel,
}) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a rating before submitting your review.',
        variant: 'destructive',
      });
      return;
    }

    if (comment.trim().length < 10) {
      toast({
        title: 'Comment Too Short',
        description: 'Please write at least 10 characters in your review.',
        variant: 'destructive',
      });
      return;
    }

    onSubmit({
      rating,
      title: title.trim(),
      comment: comment.trim(),
      photos,
    });
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    );
    
    if (newFiles.length + photos.length > 5) {
      toast({
        title: 'Too Many Photos',
        description: 'You can upload a maximum of 5 photos.',
        variant: 'destructive',
      });
      return;
    }
    
    setPhotos(prev => [...prev, ...newFiles]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      return (
        <button
          key={index}
          type="button"
          className="focus:outline-none transition-colors"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          <Star
            className={`h-8 w-8 ${
              starValue <= (hoveredRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          />
        </button>
      );
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              How would you rate this service?
            </Label>
            <div className="flex items-center gap-1">
              {renderStars()}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating}/5 stars
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience..."
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment">Your Review *</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience with this service provider..."
              rows={5}
              maxLength={1000}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {comment.length}/1000 characters
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Add Photos (Optional)
            </Label>
            
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop photos here, or click to select files
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                id="photo-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                Choose Files
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Maximum 5 photos, 5MB each
              </p>
            </div>

            {/* Photo Preview */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Review
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;