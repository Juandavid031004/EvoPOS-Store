import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

class SupabaseService {
  private static instance: SupabaseService;
  private client: ReturnType<typeof createClient<Database>> | null = null;

  private constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration. Please check your environment variables.');
    }

    this.client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      db: {
        schema: 'public'
      }
    });
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public async initialize() {
    if (!this.client) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await this.client.auth.getSession();
      if (error) throw error;

      console.log('✅ Supabase connection successful');
      return this.client;
    } catch (error) {
      console.error('❌ Supabase initialization failed:', error);
      throw error;
    }
  }

  public getClient() {
    if (!this.client) {
      throw new Error('Supabase client not initialized');
    }
    return this.client;
  }
}

export const supabaseService = SupabaseService.getInstance();
export const supabase = supabaseService.getClient();