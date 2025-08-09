import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database type definitions for TypeScript
export type Database = {
  public: {
    Tables: {
      Users: {
        Row: {
          Id: string
          UserName: string
          Email: string
          PasswordHash?: string
          CreatedAt: string
          UpdatedAt: string
        }
        Insert: {
          Id?: string
          UserName: string
          Email: string
          PasswordHash?: string
          CreatedAt?: string
          UpdatedAt?: string
        }
        Update: {
          Id?: string
          UserName?: string
          Email?: string
          PasswordHash?: string
          CreatedAt?: string
          UpdatedAt?: string
        }
      }
      Services: {
        Row: {
          Id: string
          Name: string
          Description?: string
          Price: number
          CategoryId: string
          ProviderId: string
          CreatedAt: string
          UpdatedAt: string
        }
        Insert: {
          Id?: string
          Name: string
          Description?: string
          Price: number
          CategoryId: string
          ProviderId: string
          CreatedAt?: string
          UpdatedAt?: string
        }
        Update: {
          Id?: string
          Name?: string
          Description?: string
          Price?: number
          CategoryId?: string
          ProviderId?: string
          CreatedAt?: string
          UpdatedAt?: string
        }
      }
      // Add more tables as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}