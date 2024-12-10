import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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