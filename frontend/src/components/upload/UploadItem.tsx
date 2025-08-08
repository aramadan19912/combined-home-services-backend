import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Image as ImageIcon, FileText, X, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { UploadFileItem } from '@/hooks/useAdvancedFileUpload';
import { useTranslation } from 'react-i18next';

interface UploadItemProps {
  item: UploadFileItem;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

const fileSize = (bytes: number) => {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
};

const UploadItem: React.FC<UploadItemProps> = ({ item, onRetry, onRemove }) => {
  const isImage = item.type.startsWith('image/');
  const { t } = useTranslation();
  return (
    <Card className="bg-card/50">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border">
            {isImage && item.previewUrl ? (
              <img
                src={item.previewUrl}
                alt={`${item.name} preview`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <FileText size={20} aria-hidden />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {isImage ? <ImageIcon size={16} aria-hidden /> : <FileText size={16} aria-hidden />}
              <p className="truncate text-sm font-medium">{item.name}</p>
              <span className="text-xs text-muted-foreground">{fileSize(item.size)}</span>
              {item.status === 'success' && (
                <Badge variant="secondary" className="ml-1 inline-flex items-center gap-1">
                  <CheckCircle2 size={14} /> {t('status.uploaded')}
                </Badge>
              )}
              {item.status === 'error' && (
                <Badge variant="destructive" className="ml-1 inline-flex items-center gap-1">
                  <AlertTriangle size={14} /> {t('status.failed')}
                </Badge>
              )}
            </div>

            <div className="mt-2">
              <Progress value={item.progress} aria-label={`Upload progress ${item.progress}%`} />
              {item.error && <p className="mt-1 text-xs text-destructive">{item.error}</p>}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {item.status === 'error' && (
              <Button size="icon" variant="secondary" onClick={() => onRetry(item.id)} aria-label="Retry upload">
                <RefreshCw size={16} />
              </Button>
            )}
            <Button size="icon" variant="ghost" onClick={() => onRemove(item.id)} aria-label="Remove file">
              <X size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadItem;
