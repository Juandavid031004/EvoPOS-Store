import { supabaseService } from './supabaseClient';
import { handleError } from '../utils/errorHandler';
import toast from 'react-hot-toast';

export const initializeApp = async () => {
  try {
    // Validate environment variables
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_API_URL'
    ];

    const missingEnvVars = requiredEnvVars.filter(
      varName => !import.meta.env[varName]
    );

    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}`
      );
    }

    // Initialize Supabase client
    const client = await supabaseService.initialize();
    
    // Test connection
    const { error: pingError } = await client
      .from('users')
      .select('count')
      .limit(1)
      .single();

    if (pingError && pingError.code !== 'PGRST116') {
      throw new Error('Failed to connect to Supabase');
    }

    console.log('✅ Application initialized successfully');
    return true;
  } catch (error) {
    handleError(error);
    toast.error('Failed to initialize application');
    throw error;
  }
};