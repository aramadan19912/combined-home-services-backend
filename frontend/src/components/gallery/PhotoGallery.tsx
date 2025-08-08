import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { 
  Images, 
  Eye, 
  Download, 
  Share, 
  Grid3X3, 
  Calendar,
  Star,
  ArrowLeft,
  ArrowRight,
  Play
} from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  type: 'before' | 'after' | 'progress' | 'final';
  tags?: string[];
  uploadedAt: Date;
  orderId?: string;
  serviceType?: string;
}

interface PhotoGalleryProps {
  images: GalleryImage[];
  title?: string;
  allowUpload?: boolean;
  showComparison?: boolean;
  onImageUpload?: (files: FileList) => void;
  onImageDelete?: (imageId: string) => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  images,
  title = 'Photo Gallery',
  allowUpload = false,
  showComparison = false,
  onImageUpload,
  onImageDelete,
}) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<string>('all');
  const [layout, setLayout] = useState<'grid' | 'masonry'>('grid');

  const filteredImages = images.filter(image => 
    filter === 'all' || image.type === filter
  );

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image);
    setCurrentIndex(filteredImages.findIndex(img => img.id === image.id));
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % filteredImages.length
      : (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    
    setCurrentIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') navigateImage('prev');
    if (e.key === 'ArrowRight') navigateImage('next');
    if (e.key === 'Escape') setSelectedImage(null);
  };

  const groupedByService = images.reduce((acc, image) => {
    const service = image.serviceType || 'Other';
    if (!acc[service]) acc[service] = [];
    acc[service].push(image);
    return acc;
  }, {} as Record<string, GalleryImage[]>);

  const getImagesByType = (type: GalleryImage['type']) => 
    images.filter(img => img.type === type);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Images className="h-5 w-5" />
              {title}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Filter buttons */}
              <div className="flex gap-1">
                {['all', 'before', 'after', 'progress', 'final'].map(type => (
                  <Button
                    key={type}
                    variant={filter === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
              
              {/* Layout toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLayout(layout === 'grid' ? 'masonry' : 'grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Before/After Comparison Section */}
          {showComparison && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Before & After</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(groupedByService).map(([service, serviceImages]) => {
                  const beforeImage = serviceImages.find(img => img.type === 'before');
                  const afterImage = serviceImages.find(img => img.type === 'after');
                  
                  if (!beforeImage || !afterImage) return null;
                  
                  return (
                    <Card key={service} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <h4 className="font-medium">{service}</h4>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <AspectRatio ratio={16/9}>
                              <img
                                src={beforeImage.url}
                                alt={beforeImage.title}
                                className="object-cover w-full h-full rounded cursor-pointer hover:opacity-90"
                                onClick={() => openLightbox(beforeImage)}
                              />
                            </AspectRatio>
                            <Badge variant="secondary">Before</Badge>
                          </div>
                          <div className="space-y-2">
                            <AspectRatio ratio={16/9}>
                              <img
                                src={afterImage.url}
                                alt={afterImage.title}
                                className="object-cover w-full h-full rounded cursor-pointer hover:opacity-90"
                                onClick={() => openLightbox(afterImage)}
                              />
                            </AspectRatio>
                            <Badge variant="default">After</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Gallery Grid */}
          <div className={`grid gap-4 ${
            layout === 'grid' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
              : 'columns-2 md:columns-3 lg:columns-4'
          }`}>
            {filteredImages.map((image) => (
              <div 
                key={image.id} 
                className={`group relative overflow-hidden rounded-lg cursor-pointer ${
                  layout === 'masonry' ? 'break-inside-avoid mb-4' : ''
                }`}
                onClick={() => openLightbox(image)}
              >
                <AspectRatio ratio={layout === 'grid' ? 1 : undefined}>
                  <img
                    src={image.url}
                    alt={image.title}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  />
                </AspectRatio>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center p-4">
                    <Eye className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">{image.title}</p>
                  </div>
                </div>
                
                {/* Type badge */}
                <Badge 
                  className="absolute top-2 left-2"
                  variant={
                    image.type === 'before' ? 'secondary' :
                    image.type === 'after' ? 'default' :
                    image.type === 'progress' ? 'outline' : 'destructive'
                  }
                >
                  {image.type}
                </Badge>
              </div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Images className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No images found for the selected filter.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] p-0"
          onKeyDown={handleKeyDown}
        >
          {selectedImage && (
            <>
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedImage.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedImage.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedImage.type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {currentIndex + 1} of {filteredImages.length}
                    </span>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="relative p-6 pt-0">
                <AspectRatio ratio={16/9} className="mb-4">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    className="object-contain w-full h-full rounded"
                  />
                </AspectRatio>
                
                {/* Navigation buttons */}
                {filteredImages.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => navigateImage('prev')}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => navigateImage('next')}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                {/* Image details */}
                {selectedImage.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedImage.description}
                  </p>
                )}
                
                {/* Tags */}
                {selectedImage.tags && selectedImage.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedImage.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                  
                  {filteredImages.length > 1 && (
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Slideshow
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoGallery;