import { logger } from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  // Errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.details
    });
  }

  // Errores de base de datos
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      error: 'Error de restricción en base de datos',
      details: err.message
    });
  }

  // Error genérico
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada'
  });
};