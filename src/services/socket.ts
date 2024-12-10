import { io, Socket } from 'socket.io-client';
import { SERVER_CONFIG } from '../config/server';

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io(SERVER_CONFIG.API_URL, {
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        transports: ['websocket', 'polling'],
        withCredentials: true
      });

      this.setupSocketListeners();
    }

    return this.socket;
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Conectado al servidor');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Desconectado del servidor:', reason);
      
      if (reason === 'io server disconnect') {
        // Reconexión manual si el servidor desconectó
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Máximo número de intentos de reconexión alcanzado');
        this.socket?.disconnect();
      }
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public emit(event: string, data: any) {
    if (!this.socket?.connected) {
      console.warn('Socket no conectado. Intentando reconectar...');
      this.connect();
    }
    this.socket?.emit(event, data);
  }

  public on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  public off(event: string) {
    this.socket?.off(event);
  }
}

export const socketService = SocketService.getInstance();