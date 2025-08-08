import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UploadDropzoneProps {
  onFilesAdded: (files: FileList | File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onFilesAdded, accept, multiple, disabled, className }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        'rounded-md border border-dashed p-6 text-center transition-colors',
        'bg-background/50 hover:bg-accent/30',
        isDragging && 'bg-accent',
        disabled && 'opacity-60 pointer-events-none',
        className
      )}
    >
      <UploadCloud className="mx-auto mb-2" aria-hidden size={28} />
      <p className="text-sm text-muted-foreground">{t('upload.dragOr')}</p>
      <Button
        type="button"
        variant="secondary"
        className="mt-2"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        aria-label={t('actions.browseFiles')}
      >
        {t('actions.browseFiles')}
      </Button>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        onChange={(e) => e.target.files && onFilesAdded(e.target.files)}
        aria-hidden
        tabIndex={-1}
      />
    </div>
  );
};

export default UploadDropzone;
