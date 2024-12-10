import toast from 'react-hot-toast';
import { AuthError } from '@supabase/supabase-js';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown) => {
  console.error('Error:', error);

  if (error instanceof AppError) {
    toast.error(error.message);
    return;
  }

  if (error instanceof AuthError) {
    const message = error.message === 'Invalid login credentials'
      ? 'Credenciales inválidas'
      : error.message;
    toast.error(message);
    return;
  }

  if (error instanceof Error) {
    const message = error.message.includes('network')
      ? 'Error de conexión. Por favor, verifica tu conexión a internet.'
      : error.message;
    toast.error(message);
    return;
  }

  toast.error('Ha ocurrido un error inesperado');
};