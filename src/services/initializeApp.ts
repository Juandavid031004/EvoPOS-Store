import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Singleton para el cliente de Supabase
class SupabaseService {
  private static instance: SupabaseService;
  private supabaseClient: ReturnType<typeof createClient>;

  private constructor() {
    this.supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
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

  public getClient() {
    return this.supabaseClient;
  }
}

// Exportar una única instancia del cliente
export const supabase = SupabaseService.getInstance().getClient();

export const initializeApp = async () => {
  try {
    // Verificar la conexión con Supabase
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log('✅ Supabase connection successful');
    return data;
  } catch (error) {
    console.error('❌ Error initializing app:', error);
    throw error;
  }
}; 