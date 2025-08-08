import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UploadDropzone from './UploadDropzone';
import UploadItem from './UploadItem';
import { Button } from '@/components/ui/button';
import { useAdvancedFileUpload, type AdvancedUploadOptions } from '@/hooks/useAdvancedFileUpload';
import { useTranslation } from 'react-i18next';

interface AdvancedFileUploadProps {
  title?: string;
  description?: string;
  options?: AdvancedUploadOptions;
  onUploaded?: (items: ReturnType<typeof useAdvancedFileUpload>['files']) => void;
}

const AdvancedFileUpload: React.FC<AdvancedFileUploadProps> = ({ title, description, options, onUploaded }) => {
  const { files, addFiles, removeFile, retryFile, clearAll, accept, multiple } = useAdvancedFileUpload(options);
  const { t } = useTranslation();

  React.useEffect(() => {
    const done = files.filter((f) => f.status === 'success');
    if (done.length > 0) onUploaded?.(done);
  }, [files, onUploaded]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title ?? t('upload.title')}</CardTitle>
        <CardDescription>{description ?? t('upload.desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <UploadDropzone onFilesAdded={addFiles} accept={accept} multiple={multiple} />

        <div className="mt-4 grid gap-3">
          {files.map((item) => (
            <UploadItem key={item.id} item={item} onRetry={retryFile} onRemove={removeFile} />
          ))}
        </div>

        {files.length > 0 && (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={clearAll} aria-label="Clear all files">
              {t('actions.clearAll')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedFileUpload;
