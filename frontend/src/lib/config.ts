// Runtime configuration with safe fallbacks
export interface AppConfig {
  apiBaseUrl: string;
  apiHostUrl: string;
  sentryDsn?: string;
  gaMeasurementId?: string;
  environment?: 'development' | 'staging' | 'production';
}

const DEFAULTS: AppConfig = {
  // Use environment variables or fallback to localhost for development
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://localhost:44322',
  apiHostUrl: import.meta.env.VITE_API_HOST_URL || 'https://localhost:44384',
  environment: (import.meta.env.VITE_ENVIRONMENT as 'development' | 'staging' | 'production') || 'development',
};

export function getConfig(): AppConfig {
  if (typeof window !== 'undefined') {
    const w = window as any;
    const runtime: Partial<AppConfig> = w.__APP_CONFIG__ || {};

    // Optional local overrides for testing
    try {
      const stored = localStorage.getItem('app_config');
      if (stored) {
        Object.assign(runtime, JSON.parse(stored));
      }
    } catch {}

    return { ...DEFAULTS, ...runtime } as AppConfig;
  }
  return DEFAULTS;
}
