import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}

interface PerformanceEntry {
  id: string;
  timestamp: Date;
  metrics: Partial<PerformanceMetrics>;
  resources: ResourceTiming[];
  userAgent: string;
  connectionType?: string;
  url: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private entries: PerformanceEntry[] = [];
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring(): void {
    this.observeWebVitals();
    this.observeResourceTiming();
    this.measurePageLoad();
  }

  private observeWebVitals(): void {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lcp = entries[entries.length - 1] as any;
        this.updateMetrics({ largestContentfulPaint: lcp.startTime });
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          this.updateMetrics({ firstInputDelay: entry.processingStart - entry.startTime });
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0;
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.updateMetrics({ cumulativeLayoutShift: clsValue });
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported');
      }
    }
  }

  private observeResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const resources: ResourceTiming[] = entries.map((entry: any) => ({
          name: entry.name,
          duration: entry.duration,
          size: entry.transferSize || 0,
          type: this.getResourceType(entry.name),
        }));

        this.addResourceTimings(resources);
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource observer not supported');
      }
    }
  }

  private measurePageLoad(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as any;
        if (navigation) {
          const metrics: Partial<PerformanceMetrics> = {
            pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
            firstContentfulPaint: this.getFirstContentfulPaint(),
            timeToInteractive: this.estimateTimeToInteractive(),
          };

          this.createEntry(metrics);
        }
      }, 0);
    });
  }

  private getFirstContentfulPaint(): number {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as any;
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  private estimateTimeToInteractive(): number {
    // Simplified TTI estimation
    const navigation = performance.getEntriesByType('navigation')[0] as any;
    return navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    return 'other';
  }

  private updateMetrics(newMetrics: Partial<PerformanceMetrics>): void {
    if (this.entries.length > 0) {
      const lastEntry = this.entries[this.entries.length - 1];
      lastEntry.metrics = { ...lastEntry.metrics, ...newMetrics };
    } else {
      this.createEntry(newMetrics);
    }
  }

  private addResourceTimings(resources: ResourceTiming[]): void {
    if (this.entries.length > 0) {
      const lastEntry = this.entries[this.entries.length - 1];
      lastEntry.resources.push(...resources);
    }
  }

  private createEntry(metrics: Partial<PerformanceMetrics>): void {
    const entry: PerformanceEntry = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      metrics,
      resources: [],
      userAgent: navigator.userAgent,
      connectionType: (navigator as any).connection?.effectiveType,
      url: window.location.href,
    };

    this.entries.push(entry);

    // Send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(entry);
    }
  }

  private async sendToAnalytics(entry: PerformanceEntry): Promise<void> {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to send performance data:', error);
    }
  }

  getEntries(): PerformanceEntry[] {
    return [...this.entries];
  }

  getAverageMetrics(): PerformanceMetrics {
    if (this.entries.length === 0) {
      return {
        pageLoadTime: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0,
        timeToInteractive: 0,
      };
    }

    const totals = this.entries.reduce((acc, entry) => {
      Object.keys(entry.metrics).forEach(key => {
        const value = entry.metrics[key as keyof PerformanceMetrics] || 0;
        acc[key as keyof PerformanceMetrics] = (acc[key as keyof PerformanceMetrics] || 0) + value;
      });
      return acc;
    }, {} as PerformanceMetrics);

    Object.keys(totals).forEach(key => {
      totals[key as keyof PerformanceMetrics] = totals[key as keyof PerformanceMetrics] / this.entries.length;
    });

    return totals;
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const usePerformanceMonitoring = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  const monitor = PerformanceMonitor.getInstance();

  const startMonitoring = useCallback(() => {
    if (!isMonitoring) {
      monitor.startMonitoring();
      setIsMonitoring(true);
    }
  }, [isMonitoring, monitor]);

  const stopMonitoring = useCallback(() => {
    monitor.cleanup();
    setIsMonitoring(false);
  }, [monitor]);

  const getMetrics = useCallback(() => {
    return monitor.getAverageMetrics();
  }, [monitor]);

  const getEntries = useCallback(() => {
    return monitor.getEntries();
  }, [monitor]);

  useEffect(() => {
    startMonitoring();

    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      setMetrics(getMetrics());
    }, 5000);

    return () => {
      clearInterval(interval);
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring, getMetrics]);

  return {
    isMonitoring,
    metrics,
    startMonitoring,
    stopMonitoring,
    getMetrics,
    getEntries,
  };
};