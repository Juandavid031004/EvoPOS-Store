import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Crear una única instancia de Supabase
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return supabaseInstance;
};

export const supabase = getSupabase();

export const initializeApp = async () => {
  try {
    // Verificar la conexión con Supabase
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error initializing app:', error);
    throw error;
  }
}; 