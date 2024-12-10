import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { initializeSocket } from './services/socket.js';
import { initializeDatabase, getDatabase } from './config/database.js';
import { logger } from './config/logger.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import routes from './routes/index.js';

// Inicializar Express
const app = express();
const httpServer = createServer(app);

// Inicializar base de datos
const db = initializeDatabase();
export { db };  // Exportar la instancia de la base de datos

// Inicializar Socket.IO
initializeSocket(httpServer);

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173'],
  credentials: true
}));

app.use(helmet());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Rutas API
app.use('/api', routes);

// Ruta de estado
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  logger.info(`Servidor ejecutándose en http://localhost:${PORT}`);
});

// Manejo de señales
process.on('SIGTERM', () => {
  logger.info('Cerrando servidor...');
  httpServer.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

export default app;