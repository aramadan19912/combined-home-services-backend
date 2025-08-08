import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  Image as ImageIcon, 
  Upload, 
  X, 
  Check,
  Smartphone,
  Download
} from 'lucide-react';
import { useMobileCapabilities } from '@/hooks/useMobileCapabilities';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploadProps {
  onPhotosUploaded: (photos: string[]) => void;
  maxPhotos?: number;
  existingPhotos?: string[];
}

export const MobilePhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotosUploaded,
  maxPhotos = 5,
  existingPhotos = [],
}) => {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const { capturePhoto, selectFromGallery, takePhoto, triggerHapticFeedback } = useMobileCapabilities();
  const { toast } = useToast();

  const handleCameraCapture = async () => {
    if (photos.length >= maxPhotos) {
      toast({
        title: "Photo limit reached",
        description: `You can only upload up to ${maxPhotos} photos`,
        variant: "destructive",
      });
      return;
    }

    await triggerHapticFeedback();
    setUploading(true);

    const result = await takePhoto();
    if (result.success && result.imageUrl) {
      const newPhotos = [...photos, result.imageUrl];
      setPhotos(newPhotos);
      onPhotosUploaded(newPhotos);
      
      toast({
        title: "Photo captured",
        description: "Photo has been added successfully",
      });
    }

    setUploading(false);
  };

  const handleGallerySelect = async () => {
    if (photos.length >= maxPhotos) {
      toast({
        title: "Photo limit reached",
        description: `You can only upload up to ${maxPhotos} photos`,
        variant: "destructive",
      });
      return;
    }

    await triggerHapticFeedback();
    setUploading(true);

    const result = await selectFromGallery();
    if (result.success && result.imageUrl) {
      const newPhotos = [...photos, result.imageUrl];
      setPhotos(newPhotos);
      onPhotosUploaded(newPhotos);
      
      toast({
        title: "Photo selected",
        description: "Photo has been added from gallery",
      });
    }

    setUploading(false);
  };

  const removePhoto = async (index: number) => {
    await triggerHapticFeedback();
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onPhotosUploaded(newPhotos);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Photo Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleCameraCapture}
            disabled={uploading || photos.length >= maxPhotos}
            className="h-20 flex-col gap-2"
          >
            <Camera className="w-6 h-6" />
            Take Photo
          </Button>
          <Button
            variant="outline"
            onClick={handleGallerySelect}
            disabled={uploading || photos.length >= maxPhotos}
            className="h-20 flex-col gap-2"
          >
            <ImageIcon className="w-6 h-6" />
            Gallery
          </Button>
        </div>

        {/* Photo Counter */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{photos.length} of {maxPhotos} photos</span>
          <Badge variant={photos.length >= maxPhotos ? "destructive" : "secondary"}>
            {maxPhotos - photos.length} remaining
          </Badge>
        </div>

        {/* Upload Status */}
        {uploading && (
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              Processing photo...
            </AlertDescription>
          </Alert>
        )}

        {/* Photo Preview Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={photo}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePhoto(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {index + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Tips */}
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Tip: Hold your phone steady and ensure good lighting for best results. 
            Photos will be automatically optimized for upload.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};