import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useToast } from '@/hooks/use-toast';

export const useMobileCapabilities = () => {
  const { toast } = useToast();

  const capturePhoto = async (options?: {
    source?: CameraSource;
    quality?: number;
    allowEditing?: boolean;
  }) => {
    try {
      // Provide haptic feedback
      await Haptics.impact({ style: ImpactStyle.Light });
      
      const image = await Camera.getPhoto({
        quality: options?.quality || 90,
        allowEditing: options?.allowEditing || true,
        resultType: CameraResultType.Uri,
        source: options?.source || CameraSource.Prompt,
      });

      return {
        success: true,
        imageUrl: image.webPath,
        format: image.format,
      };
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera Error",
        description: "Unable to capture photo. Please check camera permissions.",
        variant: "destructive",
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown camera error',
      };
    }
  };

  const triggerHapticFeedback = async (style: ImpactStyle = ImpactStyle.Medium) => {
    try {
      await Haptics.impact({ style });
    } catch (error) {
      // Haptics not available on this platform
      console.log('Haptics not available:', error);
    }
  };

  const selectFromGallery = () => capturePhoto({ source: CameraSource.Photos });
  const takePhoto = () => capturePhoto({ source: CameraSource.Camera });

  return {
    capturePhoto,
    selectFromGallery,
    takePhoto,
    triggerHapticFeedback,
  };
};