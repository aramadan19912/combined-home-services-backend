import axios, { AxiosResponse, AxiosError } from 'axios';

// Environment variables (migrated to runtime config)
import { getConfig } from '@/lib/config';
const { apiBaseUrl: API_BASE_URL, apiHostUrl: API_HOST_URL } = getConfig();

// Create axios instances
export const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiClient = axios.create({
  baseURL: API_HOST_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
const addAuthToken = (config: any) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authClient.interceptors.request.use(addAuthToken);
apiClient.interceptors.request.use(addAuthToken);

// Response interceptor for error handling
const handleResponseError = (error: AxiosError) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

authClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  handleResponseError
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  handleResponseError
);

// Generic API response wrapper
export const apiRequest = async <T>(
  request: () => Promise<AxiosResponse<T>>
): Promise<T> => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'An unexpected error occurred'
      );
    }
    throw error;
  }
};