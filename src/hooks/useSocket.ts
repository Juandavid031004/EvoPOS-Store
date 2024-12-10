import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SERVER_CONFIG } from '../config/server';

let socket: Socket | null = null;

export const useSocket = (businessEmail: string | null) => {
  useEffect(() => {
    if (!businessEmail) return;

    if (!socket) {
      socket = io(SERVER_CONFIG.API_URL);
      
      socket.on('connect', () => {
        console.log('Connected to server');
        socket?.emit('joinBusiness', businessEmail);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [businessEmail]);

  const emitUpdate = useCallback((type: string, action: string, data: any) => {
    if (socket && businessEmail) {
      socket.emit('dataUpdated', {
        type,
        action,
        data,
        businessEmail
      });
    }
  }, [businessEmail]);

  return { emitUpdate };
};