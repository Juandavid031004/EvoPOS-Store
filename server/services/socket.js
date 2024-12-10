import { Server } from 'socket.io';
import { logger } from '../config/logger.js';

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? ['https://hostybee.com']
        : ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    logger.info(`Cliente conectado: ${socket.id}`);

    socket.on('joinBusiness', (businessEmail) => {
      socket.join(businessEmail);
      logger.info(`Cliente ${socket.id} unido al negocio: ${businessEmail}`);
      
      // Enviar datos actualizados al cliente
      socket.emit('syncRequest');
    });

    socket.on('disconnect', () => {
      logger.info(`Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO no inicializado');
  }
  return io;
};

export const emitToBusinessRoom = (businessEmail, event, data) => {
  if (!io) {
    throw new Error('Socket.IO no inicializado');
  }
  io.to(businessEmail).emit(event, data);
};