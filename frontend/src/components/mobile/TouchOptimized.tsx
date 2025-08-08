import { ReactNode, TouchEvent, useState } from 'react';
import { cn } from '@/lib/utils';

interface TouchOptimizedProps {
  children: ReactNode;
  onTap?: () => void;
  onLongPress?: () => void;
  className?: string;
  disabled?: boolean;
  hapticFeedback?: boolean;
}

const TouchOptimized = ({ 
  children, 
  onTap, 
  onLongPress, 
  className, 
  disabled = false,
  hapticFeedback = true 
}: TouchOptimizedProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (hapticFeedback && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled) return;
    
    setIsPressed(true);
    triggerHaptic('light');

    if (onLongPress) {
      const timer = setTimeout(() => {
        triggerHaptic('medium');
        onLongPress();
        setLongPressTimer(null);
      }, 500);
      setLongPressTimer(timer);
    }
  };

  const handleTouchEnd = () => {
    if (disabled) return;
    
    setIsPressed(false);
    
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
      
      if (onTap) {
        triggerHaptic('light');
        onTap();
      }
    }
  };

  const handleTouchCancel = () => {
    setIsPressed(false);
    
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <div
      className={cn(
        'touch-manipulation select-none transition-all duration-150',
        isPressed && 'scale-95 opacity-80',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {children}
    </div>
  );
};

export default TouchOptimized;