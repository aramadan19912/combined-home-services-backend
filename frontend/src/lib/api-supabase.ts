import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:44322';

// Create API client with Supabase auth integration
export class SupabaseApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return response.text() as unknown as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // File upload with progress tracking
  async uploadFile(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();
    
    // Remove Content-Type header for file uploads to let browser set boundary
    delete (headers as any)['Content-Type'];

    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.open('POST', url);
      
      // Set authorization header
      Object.entries(headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          xhr.setRequestHeader(key, value);
        }
      });

      xhr.send(formData);
    });
  }
}

// Create singleton instance
export const supabaseApiClient = new SupabaseApiClient();

// Supabase-specific utilities
export const supabaseUtils = {
  // Storage utilities
  storage: {
    async uploadFile(
      bucket: string,
      path: string,
      file: File,
      options?: { upsert?: boolean; contentType?: string }
    ) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: options?.upsert || false,
          contentType: options?.contentType || file.type,
        });

      if (error) throw error;
      return data;
    },

    async getPublicUrl(bucket: string, path: string) {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return data.publicUrl;
    },

    async downloadFile(bucket: string, path: string) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error) throw error;
      return data;
    },

    async deleteFile(bucket: string, paths: string[]) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove(paths);

      if (error) throw error;
      return data;
    },
  },

  // Database utilities
  database: {
    // Real-time subscriptions
    subscribeToTable(
      table: string,
      callback: (payload: any) => void,
      filter?: string
    ) {
      const channel = supabase
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: filter,
          },
          callback
        )
        .subscribe();

      return channel;
    },

    // Unsubscribe from channel
    unsubscribe(channel: any) {
      return supabase.removeChannel(channel);
    },

    // Generic database operations
    async select(table: string, columns = '*', filters?: any) {
      let query = supabase.from(table).select(columns);

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async insert(table: string, data: any) {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();

      if (error) throw error;
      return result;
    },

    async update(table: string, id: string, data: any) {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('Id', id)
        .select();

      if (error) throw error;
      return result;
    },

    async delete(table: string, id: string) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('Id', id);

      if (error) throw error;
    },
  },

  // Auth utilities
  auth: {
    async getCurrentUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },

    async getCurrentSession() {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },

    async refreshSession() {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return data;
    },

    async updateUserMetadata(metadata: any) {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata,
      });
      if (error) throw error;
      return data;
    },
  },
};

// Export individual methods for convenience
export const {
  storage: supabaseStorage,
  database: supabaseDatabase,
  auth: supabaseAuth,
} = supabaseUtils;