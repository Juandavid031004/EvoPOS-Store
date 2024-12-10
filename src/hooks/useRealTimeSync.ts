import { useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { handleError } from '../utils/errorHandler';

export function useRealTimeSync(businessEmail: string | null, onDataUpdate: (data: any) => void) {
  const handleChange = useCallback((payload: any) => {
    const { table, type, record, old_record } = payload;
    
    onDataUpdate({
      type,
      table,
      data: type === 'DELETE' ? old_record : record
    });
  }, [onDataUpdate]);

  useEffect(() => {
    if (!businessEmail) return;

    try {
      const channel = supabase
        .channel('db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            filter: `business_email=eq.${businessEmail}`
          },
          handleChange
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      handleError(error);
    }
  }, [businessEmail, handleChange]);
}