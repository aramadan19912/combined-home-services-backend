import { useState, useEffect, useRef, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  disabled?: boolean;
}

const PullToRefresh = ({ onRefresh, children, disabled = false }: PullToRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    if (diff > 0) {
      e.preventDefault();
      const distance = Math.min(diff * 0.5, MAX_PULL);
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling || disabled) return;

    setIsPulling(false);

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, startY, disabled, isRefreshing]);

  const getRefreshIndicatorStyle = () => {
    const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
    const scale = 0.5 + (progress * 0.5);
    const opacity = Math.min(progress, 1);
    
    return {
      transform: `translateY(${pullDistance}px) scale(${scale})`,
      opacity,
    };
  };

  return (
    <div ref={containerRef} className="relative overflow-auto h-full">
      {/* Pull to refresh indicator */}
      <div 
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-50 flex items-center justify-center"
        style={getRefreshIndicatorStyle()}
      >
        <div className="bg-background border border-border rounded-full p-3 shadow-lg">
          <RefreshCw 
            className={`h-5 w-5 text-primary ${
              isRefreshing || pullDistance >= PULL_THRESHOLD ? 'animate-spin' : ''
            }`} 
          />
        </div>
      </div>

      {/* Content with pull offset */}
      <div 
        style={{
          transform: `translateY(${isPulling ? pullDistance : 0}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;