import { useEffect } from 'react';
import { socketService } from '../services/socket';

export const useDataSync = (businessEmail: string | null, onDataUpdate: (data: any) => void) => {
  useEffect(() => {
    if (!businessEmail) return;

    const socket = socketService.getSocket();

    socket.on('dataUpdated', (data) => {
      onDataUpdate(data);
    });

    return () => {
      socket.off('dataUpdated');
    };
  }, [businessEmail, onDataUpdate]);
};