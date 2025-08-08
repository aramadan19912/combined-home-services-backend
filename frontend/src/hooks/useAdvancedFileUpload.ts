import { useCallback, useMemo, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { toast } from '@/hooks/use-toast';
import { authClient } from '@/lib/api-client';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface UploadResult {
  id: string;
  url: string;
}

export interface UploadFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  remoteUrl?: string;
  progress: number;
  status: UploadStatus;
  error?: string | null;
  uploadedAt?: Date;
}

export interface AdvancedUploadOptions {
  maxSizeMB?: number; // Max size before compression check
  allowedTypes?: string[];
  multiple?: boolean;
  compressImages?: boolean;
  compression?: {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    initialQuality?: number;
    useWebWorker?: boolean;
  };
  secure?: boolean; // Use authenticated uploader by default
  uploader?: (file: File, onProgress: (p: number) => void) => Promise<UploadResult>;
}

const defaultOptions: Required<Pick<AdvancedUploadOptions, 'maxSizeMB' | 'allowedTypes' | 'multiple' | 'compressImages' | 'compression' | 'secure'>> = {
  maxSizeMB: 10,
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  multiple: true,
  compressImages: true,
  compression: {
    maxSizeMB: 1.2,
    maxWidthOrHeight: 1600,
    initialQuality: 0.8,
    useWebWorker: true,
  },
  secure: true,
};

function fileAcceptFromMimes(mimes: string[]) {
  // Convert mime list into accept attribute string
  const extensions = mimes
    .map((m) => (m.startsWith('image/') ? m.replace('image/', 'image/*') : m))
    .join(',');
  return extensions;
}

function isImageType(type: string) {
  return type.startsWith('image/');
}

export function useAdvancedFileUpload(opts: AdvancedUploadOptions = {}) {
  const options = { ...defaultOptions, ...opts };
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const validate = useCallback(
    (file: File): string | null => {
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        return `File type not allowed. Allowed: ${options.allowedTypes.join(', ')}`;
      }
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > options.maxSizeMB) {
        return `File too large. Max ${options.maxSizeMB}MB`;
      }
      return null;
    },
    [options.allowedTypes, options.maxSizeMB]
  );

  const getPreviewUrl = (file: File) => (isImageType(file.type) ? URL.createObjectURL(file) : undefined);

  const secureUploader = useCallback(
    async (file: File, onProgress: (p: number) => void): Promise<UploadResult> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await authClient.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (!e.total) return;
          onProgress(Math.min(99, Math.round((e.loaded * 100) / e.total)));
        },
      });

      const data = response.data as any;
      if (!data || (!data.id && !data.fileId) || (!data.url && !data.fileUrl)) {
        throw new Error('Upload response missing id/url');
      }
      return { id: String(data.id ?? data.fileId), url: String(data.url ?? data.fileUrl) };
    },
    []
  );

  const mockUploader = useCallback(async (file: File, onProgress: (p: number) => void): Promise<UploadResult> => {
    await new Promise<void>((resolve) => {
      let progress = 0;
      const timer = setInterval(() => {
        progress = Math.min(95, progress + 10);
        onProgress(progress);
      }, 120);
      setTimeout(() => {
        clearInterval(timer);
        resolve();
      }, 1200);
    });
    return { id: `file_${Date.now()}`, url: URL.createObjectURL(file) };
  }, []);

  const uploader = options.uploader ?? (options.secure ? secureUploader : mockUploader);

  const startUpload = useCallback(
    async (itemId: string, originalFile?: File) => {
      setFiles((prev) => prev.map((f) => (f.id === itemId ? { ...f, status: 'uploading', progress: 0, error: null } : f)));

      const controller = new AbortController();
      abortControllers.current.set(itemId, controller);

      try {
        const current = files.find((f) => f.id === itemId);
        const file = originalFile ?? current?.file;
        if (!file) throw new Error('File not found');

        let uploadFile = file;
        // Compress if image and enabled
        if (options.compressImages && isImageType(file.type)) {
          try {
            uploadFile = await imageCompression(file, {
              maxSizeMB: options.compression.maxSizeMB,
              maxWidthOrHeight: options.compression.maxWidthOrHeight,
              initialQuality: options.compression.initialQuality,
              useWebWorker: options.compression.useWebWorker,
            });
          } catch (e) {
            console.warn('Compression failed, uploading original file', e);
          }
        }

        const result = await uploader(uploadFile, (p) => {
          setFiles((prev) => prev.map((f) => (f.id === itemId ? { ...f, progress: p } : f)));
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === itemId
              ? { ...f, status: 'success', progress: 100, remoteUrl: result.url, uploadedAt: new Date() }
              : f
          )
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        setFiles((prev) => prev.map((f) => (f.id === itemId ? { ...f, status: 'error', error: message } : f)));
        toast({ title: 'Upload Failed', description: message, variant: 'destructive' });
      } finally {
        abortControllers.current.delete(itemId);
      }
    },
    [files, options.compressImages, options.compression, uploader]
  );

  const addFiles = useCallback(
    async (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      if (!options.multiple && list.length > 1) {
        toast({ title: 'Upload Error', description: 'Multiple files not allowed', variant: 'destructive' });
        return;
      }

      const toAdd: UploadFileItem[] = [];
      for (const f of list) {
        const v = validate(f);
        if (v) {
          toast({ title: 'Invalid File', description: v, variant: 'destructive' });
          continue;
        }
        const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        toAdd.push({
          id,
          file: f,
          name: f.name,
          size: f.size,
          type: f.type,
          previewUrl: getPreviewUrl(f),
          progress: 0,
          status: 'idle',
          error: null,
        });
      }

      setFiles((prev) => (options.multiple ? [...prev, ...toAdd] : toAdd.slice(0, 1)));

      // start uploads
      for (const item of toAdd) {
        startUpload(item.id, item.file);
      }
    },
    [options.multiple, startUpload, validate]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const retryFile = useCallback(
    (id: string) => {
      const item = files.find((f) => f.id === id);
      if (item) startUpload(id, item.file);
    },
    [files, startUpload]
  );

  const clearAll = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
      return [];
    });
  }, []);

  const accept = useMemo(() => fileAcceptFromMimes(options.allowedTypes), [options.allowedTypes]);

  return {
    files,
    addFiles,
    removeFile,
    retryFile,
    clearAll,
    accept,
    multiple: options.multiple,
  };
}
