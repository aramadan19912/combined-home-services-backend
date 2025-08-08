/**
 * API Optimization Utilities
 * This file provides performance optimizations for API calls including
 * caching, request deduplication, and performance monitoring.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    // Remove entries matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const apiCache = new APICache();

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

export function deduplicateRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

// Performance monitoring
export class APIPerformanceMonitor {
  private metrics = new Map<string, Array<{ duration: number; timestamp: number; success: boolean }>>();

  recordRequest(endpoint: string, duration: number, success: boolean): void {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }

    const metrics = this.metrics.get(endpoint)!;
    metrics.push({ duration, timestamp: Date.now(), success });

    // Keep only last 100 requests per endpoint
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  getMetrics(endpoint: string) {
    const metrics = this.metrics.get(endpoint) || [];
    if (metrics.length === 0) return null;

    const durations = metrics.map(m => m.duration);
    const successRate = metrics.filter(m => m.success).length / metrics.length;

    return {
      count: metrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: successRate * 100,
      lastRequest: metrics[metrics.length - 1]?.timestamp
    };
  }

  getAllMetrics() {
    const result: Record<string, any> = {};
    for (const [endpoint, _] of this.metrics) {
      result[endpoint] = this.getMetrics(endpoint);
    }
    return result;
  }

  reset(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = new APIPerformanceMonitor();

// Enhanced API wrapper with caching and monitoring
export function createOptimizedAPICall<T>(
  key: string,
  requestFn: () => Promise<T>,
  options: {
    cache?: boolean;
    cacheTTL?: number;
    deduplicate?: boolean;
    monitor?: boolean;
  } = {}
): Promise<T> {
  const {
    cache = false,
    cacheTTL = 5 * 60 * 1000,
    deduplicate = true,
    monitor = true
  } = options;

  const startTime = Date.now();

  // Check cache first
  if (cache) {
    const cached = apiCache.get<T>(key);
    if (cached) {
      if (monitor) {
        performanceMonitor.recordRequest(`${key} (cached)`, Date.now() - startTime, true);
      }
      return Promise.resolve(cached);
    }
  }

  const executeRequest = async (): Promise<T> => {
    try {
      const result = await requestFn();
      const duration = Date.now() - startTime;

      if (cache) {
        apiCache.set(key, result, cacheTTL);
      }

      if (monitor) {
        performanceMonitor.recordRequest(key, duration, true);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (monitor) {
        performanceMonitor.recordRequest(key, duration, false);
      }

      throw error;
    }
  };

  if (deduplicate) {
    return deduplicateRequest(key, executeRequest);
  }

  return executeRequest();
}

// Cleanup utility for memory management
export function cleanupAPIOptimizations(): void {
  apiCache.cleanup();
  
  // Clean up old pending requests (shouldn't happen but just in case)
  pendingRequests.clear();
}

// Auto cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupAPIOptimizations, 10 * 60 * 1000);
  
  // Make utilities available globally for debugging
  (window as any).apiCache = apiCache;
  (window as any).performanceMonitor = performanceMonitor;
}