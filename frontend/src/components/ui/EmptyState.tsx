/**
 * EmptyState Component
 * Beautiful empty states for better UX
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  FileText,
  MessageSquare,
  MapPin,
  Star,
  ShoppingCart,
  Search,
  Inbox,
  AlertCircle,
  HelpCircle,
  FileQuestion,
  FolderOpen,
  Sparkles,
} from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  type?: 'default' | 'card' | 'inline';
  variant?: 'default' | 'search' | 'error' | 'success';
  className?: string;
}

const defaultIcons = {
  default: <FolderOpen className="h-16 w-16" />,
  search: <Search className="h-16 w-16" />,
  error: <AlertCircle className="h-16 w-16" />,
  success: <Sparkles className="h-16 w-16" />,
};

const variantStyles = {
  default: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    titleColor: 'text-foreground',
  },
  search: {
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    titleColor: 'text-foreground',
  },
  error: {
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    titleColor: 'text-destructive',
  },
  success: {
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
    titleColor: 'text-foreground',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  type = 'default',
  variant = 'default',
  className = '',
}) => {
  const styles = variantStyles[variant];
  const displayIcon = icon || defaultIcons[variant];

  const Content = () => (
    <div className="flex flex-col items-center text-center max-w-md mx-auto">
      {/* Icon with animated background */}
      <div className="relative mb-6">
        <div className={`absolute inset-0 ${styles.iconBg} rounded-full blur-2xl opacity-50 animate-pulse`} />
        <div className={`relative ${styles.iconBg} ${styles.iconColor} p-6 rounded-full`}>
          {displayIcon}
        </div>
      </div>

      {/* Title */}
      <h3 className={`text-xl font-semibold mb-2 ${styles.titleColor}`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {action && (
            <Button
              onClick={action.onClick}
              size="lg"
              className="w-full sm:w-auto"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (type === 'inline') {
    return (
      <div className={`py-8 ${className}`}>
        <Content />
      </div>
    );
  }

  if (type === 'card') {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <Content />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <Content />
    </div>
  );
};

// Preset empty states for common scenarios
export const NoOrders: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    icon={<ShoppingCart className="h-16 w-16" />}
    title="No orders yet"
    description="Start by creating your first order. It's quick and easy!"
    action={onCreate ? { label: 'Create Order', onClick: onCreate } : undefined}
  />
);

export const NoReviews: React.FC<{ onWrite?: () => void }> = ({ onWrite }) => (
  <EmptyState
    icon={<Star className="h-16 w-16" />}
    title="No reviews yet"
    description="Be the first to share your experience with this service."
    action={onWrite ? { label: 'Write Review', onClick: onWrite } : undefined}
  />
);

export const NoMessages: React.FC = () => (
  <EmptyState
    icon={<MessageSquare className="h-16 w-16" />}
    title="No messages"
    description="Your conversation will appear here once you start chatting."
    type="inline"
  />
);

export const SearchNoResults: React.FC<{ onClear?: () => void }> = ({ onClear }) => (
  <EmptyState
    icon={<Search className="h-16 w-16" />}
    title="No results found"
    description="Try adjusting your search or filters to find what you're looking for."
    variant="search"
    action={onClear ? { label: 'Clear Search', onClick: onClear } : undefined}
  />
);

export default EmptyState;
