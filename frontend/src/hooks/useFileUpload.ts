import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface UploadOptions {
  maxSize?: number; // in MB
  allowedTypes?: string[];
  multiple?: boolean;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadedFiles: UploadedFile[];
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

const defaultOptions: UploadOptions = {
  maxSize: 10, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  multiple: false,
};

export const useFileUpload = (options: UploadOptions = {}) => {
  const config = { ...defaultOptions, ...options };
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    uploadedFiles: [],
  });

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    const maxSizeBytes = config.maxSize! * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${config.maxSize}MB`;
    }

    // Check file type
    if (config.allowedTypes && !config.allowedTypes.includes(file.type)) {
      return `File type not allowed. Allowed types: ${config.allowedTypes.join(', ')}`;
    }

    return null;
  }, [config]);

  const uploadFiles = useCallback(async (files: FileList | File[]): Promise<UploadedFile[]> => {
    const fileArray = Array.from(files);
    
    if (!config.multiple && fileArray.length > 1) {
      setState(prev => ({ ...prev, error: 'Multiple files not allowed' }));
      return [];
    }

    // Validate all files first
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setState(prev => ({ ...prev, error: validationError }));
        toast({
          title: 'Upload Error',
          description: validationError,
          variant: 'destructive',
        });
        return [];
      }
    }

    setState(prev => ({ 
      ...prev, 
      uploading: true, 
      progress: 0, 
      error: null 
    }));

    try {
      const uploadPromises = fileArray.map(async (file, index) => {
        // Simulate upload progress
        const formData = new FormData();
        formData.append('file', file);

        // Mock upload - replace with actual API call
        await new Promise(resolve => {
          const interval = setInterval(() => {
            setState(prev => {
              const newProgress = Math.min(prev.progress + 10, 90);
              return { ...prev, progress: newProgress };
            });
          }, 100);

          setTimeout(() => {
            clearInterval(interval);
            resolve(true);
          }, 1000);
        });

        // Mock uploaded file response
        const uploadedFile: UploadedFile = {
          id: `file_${Date.now()}_${index}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file), // In real app, this would be the server URL
          uploadedAt: new Date(),
        };

        return uploadedFile;
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 100,
        uploadedFiles: [...prev.uploadedFiles, ...uploadedFiles],
      }));

      toast({
        title: 'Upload Successful',
        description: `${uploadedFiles.length} file(s) uploaded successfully`,
      });

      return uploadedFiles;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: errorMessage,
      }));

      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      return [];
    }
  }, [config, validateFile]);

  const removeFile = useCallback((fileId: string) => {
    setState(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(file => file.id !== fileId),
    }));
  }, []);

  const clearFiles = useCallback(() => {
    setState(prev => ({
      ...prev,
      uploadedFiles: [],
      progress: 0,
      error: null,
    }));
  }, []);

  const getFilePreview = useCallback((file: UploadedFile): string | null => {
    if (file.type.startsWith('image/')) {
      return file.url;
    }
    return null;
  }, []);

  return {
    ...state,
    uploadFiles,
    removeFile,
    clearFiles,
    getFilePreview,
    validateFile,
  };
};