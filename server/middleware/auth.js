import { logger } from '../config/logger.js';

export const authMiddleware = (req, res, next) => {
  const businessEmail = req.headers['x-business-email'];
  
  if (!businessEmail) {
    logger.warn('Intento de acceso sin business-email');
    return res.status(401).json({ error: 'Se requiere business-email' });
  }

  req.businessEmail = businessEmail;
  next();
};

export const checkPermissions = (requiredPermissions) => {
  return (req, res, next) => {
    const userPermissions = req.user?.permisos || [];
    
    const hasPermission = requiredPermissions.every(
      permission => userPermissions.includes(permission)
    );

    if (!hasPermission) {
      logger.warn(`Usuario sin permisos suficientes: ${req.user?.username}`);
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }

    next();
  };
};