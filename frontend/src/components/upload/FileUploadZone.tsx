import { useState } from 'react';
import { Upload, X, FileImage, FileText, Eye, Download, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFileUpload } from '@/hooks/useFileUpload';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFilesUploaded?: (files: any[]) => void;
  options?: {
    maxSize?: number;
    allowedTypes?: string[];
    multiple?: boolean;
  };
  className?: string;
}

const FileUploadZone = ({ onFilesUploaded, options, className }: FileUploadZoneProps) => {
  const [dragOver, setDragOver] = useState(false);
  const { 
    uploading, 
    progress, 
    error, 
    uploadedFiles, 
    uploadFiles, 
    removeFile, 
    clearFiles,
    getFilePreview 
  } = useFileUpload(options);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const uploaded = await uploadFiles(files);
      onFilesUploaded?.(uploaded);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const uploaded = await uploadFiles(files);
      onFilesUploaded?.(uploaded);
    }
    // Reset input
    e.target.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <FileImage className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          File Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Zone */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
            uploading && 'opacity-50 pointer-events-none'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {dragOver ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse files
            </p>
            <input
              type="file"
              multiple={options?.multiple}
              accept={options?.allowedTypes?.join(',')}
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <Button 
              variant="outline" 
              asChild
              disabled={uploading}
            >
              <label htmlFor="file-upload" className="cursor-pointer">
                Browse Files
              </label>
            </Button>
          </div>
          
          {options && (
            <div className="mt-4 text-xs text-muted-foreground space-y-1">
              {options.maxSize && (
                <p>Max file size: {options.maxSize}MB</p>
              )}
              {options.allowedTypes && (
                <p>Allowed types: {options.allowedTypes.join(', ')}</p>
              )}
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Uploaded Files</h4>
              <Button variant="outline" size="sm" onClick={clearFiles}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
            
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div 
                  key={file.id} 
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  {getFileIcon(file.type)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {getFilePreview(file) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = file.url;
                        link.download = file.name;
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploadZone;