/**
 * LoadingState Component
 * Beautiful loading states with animations
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Package, FileText, MessageSquare, MapPin } from 'lucide-react';

export interface LoadingStateProps {
  type?: 'default' | 'card' | 'inline' | 'page' | 'skeleton';
  message?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'default',
  message = 'Loading...',
  icon,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const Spinner = () => (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
  );

  if (type === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Spinner />
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </div>
    );
  }

  if (type === 'page') {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen gap-4 ${className}`}>
        <div className="relative">
          <div className="absolute inset-0 animate-ping opacity-75">
            <div className="h-16 w-16 rounded-full bg-primary/20" />
          </div>
          <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
        </div>
        {message && (
          <p className="text-lg text-muted-foreground animate-pulse">{message}</p>
        )}
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="h-12 w-full animate-pulse bg-muted rounded-lg" />
        <div className="h-32 w-full animate-pulse bg-muted rounded-lg" />
        <div className="h-24 w-full animate-pulse bg-muted rounded-lg" />
      </div>
    );
  }

  if (type === 'card') {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          {icon || <Spinner />}
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <Spinner />
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
};

// Skeleton loaders for specific content types
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Card className={className}>
    <CardContent className="p-6 space-y-4">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted rounded animate-pulse" />
        <div className="h-3 w-5/6 bg-muted rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

export const SkeletonList: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = '',
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default LoadingState;
