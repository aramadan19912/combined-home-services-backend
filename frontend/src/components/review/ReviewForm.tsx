/**
 * ReviewForm Component
 * Enhanced review submission form with detailed ratings
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Star,
  StarHalf,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export interface ReviewFormData {
  rating: number;
  serviceQualityRating: number;
  professionalismRating: number;
  punctualityRating: number;
  valueRating: number;
  comment: string;
  isAnonymous: boolean;
  images: File[];
}

export interface ReviewFormProps {
  orderId: string;
  providerId: string;
  serviceId: string;
  initialData?: Partial<ReviewFormData>;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  orderId,
  providerId,
  serviceId,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = '',
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<ReviewFormData>({
    rating: initialData?.rating || 5,
    serviceQualityRating: initialData?.serviceQualityRating || 5,
    professionalismRating: initialData?.professionalismRating || 5,
    punctualityRating: initialData?.punctualityRating || 5,
    valueRating: initialData?.valueRating || 5,
    comment: initialData?.comment || '',
    isAnonymous: initialData?.isAnonymous || false,
    images: initialData?.images || [],
  });

  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const handleRatingChange = (field: keyof ReviewFormData, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file count (max 5 images)
    if (formData.images.length + files.length > 5) {
      toast.error(t('review.maxImagesExceeded'));
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(t('review.imageTooLarge'));
      return;
    }

    // Create preview URLs
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    // Revoke URL to free memory
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.comment.trim()) {
      toast.error(t('review.commentRequired'));
      return;
    }

    if (formData.comment.length < 10) {
      toast.error(t('review.commentTooShort'));
      return;
    }

    try {
      await onSubmit(formData);
      toast.success(t('review.submitSuccess'));
    } catch (error) {
      toast.error(t('review.submitFailed'));
    }
  };

  const renderStarRating = (
    label: string,
    value: number,
    onChange: (value: number) => void
  ) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{label}</Label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onChange(star)}
                className="p-0.5 transition hover:scale-110"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= value
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm font-semibold text-muted-foreground">
              {value}/5
            </span>
          </div>
        </div>
      </div>
    );
  };

  const averageRating = (
    (formData.serviceQualityRating +
      formData.professionalismRating +
      formData.punctualityRating +
      formData.valueRating) /
    4
  ).toFixed(1);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {t('review.writeReview')}
          <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>
              {t('review.overallRating')}: {averageRating}
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          {renderStarRating(
            t('review.overallRating'),
            formData.rating,
            (value) => handleRatingChange('rating', value)
          )}

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">
              {t('review.detailedRatings')}
            </h3>

            <div className="space-y-4">
              {/* Service Quality */}
              {renderStarRating(
                t('review.serviceQuality'),
                formData.serviceQualityRating,
                (value) => handleRatingChange('serviceQualityRating', value)
              )}

              {/* Professionalism */}
              {renderStarRating(
                t('review.professionalism'),
                formData.professionalismRating,
                (value) => handleRatingChange('professionalismRating', value)
              )}

              {/* Punctuality */}
              {renderStarRating(
                t('review.punctuality'),
                formData.punctualityRating,
                (value) => handleRatingChange('punctualityRating', value)
              )}

              {/* Value for Money */}
              {renderStarRating(
                t('review.valueForMoney'),
                formData.valueRating,
                (value) => handleRatingChange('valueRating', value)
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">{t('review.yourReview')}</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, comment: e.target.value }))
              }
              placeholder={t('review.commentPlaceholder')}
              rows={5}
              maxLength={1000}
              className="resize-none"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {formData.comment.length < 10 ? (
                  <span className="flex items-center gap-1 text-orange-500">
                    <AlertCircle className="h-3 w-3" />
                    {t('review.minimumLength', { count: 10 })}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-green-500">
                    <CheckCircle2 className="h-3 w-3" />
                    {t('review.lengthOk')}
                  </span>
                )}
              </span>
              <span>
                {formData.comment.length} / 1000
              </span>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>{t('review.addPhotos')}</Label>
            <div className="grid grid-cols-5 gap-2">
              {/* Preview Images */}
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {/* Upload Button */}
              {formData.images.length < 5 && (
                <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition">
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">
                    {t('review.uploadPhoto')}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('review.imageGuidelines')}
            </p>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="anonymous" className="text-sm font-medium">
                {t('review.postAnonymously')}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t('review.anonymousDescription')}
              </p>
            </div>
            <Switch
              id="anonymous"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isAnonymous: checked }))
              }
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || formData.comment.length < 10}
              className="flex-1"
            >
              {isSubmitting ? t('review.submitting') : t('review.submitReview')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
