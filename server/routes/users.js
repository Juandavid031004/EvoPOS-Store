import express from 'express';
import { runQuery } from '../config/database.js';
import { logger } from '../config/logger.js';

const router = express.Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    logger.info('📥 Solicitud para obtener todos los usuarios activos');
    const users = await runQuery('SELECT * FROM users WHERE activo = 1');
    logger.info(`✅ ${users.length} usuarios recuperados exitosamente`);
    res.json(users);
  } catch (err) {
    logger.error('❌ Error al obtener usuarios:', { error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
});

// Obtener un usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`📥 Solicitud para obtener usuario con ID: ${id}`);
    
    const user = await runQuery('SELECT * FROM users WHERE id = ?', [id]);
    
    if (!user || user.length === 0) {
      logger.warn(`⚠️ Usuario con ID ${id} no encontrado`);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    logger.info(`✅ Usuario ${id} recuperado exitosamente`);
    res.json(user[0]);
  } catch (err) {
    logger.error('❌ Error al obtener usuario por ID:', { 
      id: req.params.id, 
      error: err.message, 
      stack: err.stack 
    });
    res.status(500).json({ error: err.message });
  }
});

// Crear usuario
router.post('/', async (req, res) => {
  try {
    const { email, nombre, username, password, rol, sucursal_id, permisos } = req.body;
    logger.info(`📥 Solicitud para crear usuario con email: ${email}`);
    
    const result = await runQuery(
      `INSERT INTO users (email, nombre, username, password, rol, sucursal_id, permisos) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, nombre, username, password, rol, sucursal_id, JSON.stringify(permisos)]
    );
    
    logger.info(`✅ Usuario creado exitosamente con ID: ${result.insertId}`);
    res.json({
      id: result.insertId,
      message: 'Usuario creado exitosamente'
    });
  } catch (err) {
    logger.error('❌ Error al crear usuario:', { 
      email: req.body.email, 
      error: err.message, 
      stack: err.stack 
    });
    res.status(500).json({ error: err.message });
  }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nombre, username, password, rol, sucursal_id, permisos, activo } = req.body;
    logger.info(`📥 Solicitud para actualizar usuario con ID: ${id}`);
    
    await runQuery(
      `UPDATE users 
       SET email = ?, nombre = ?, username = ?, password = ?, 
           rol = ?, sucursal_id = ?, permisos = ?, activo = ?
       WHERE id = ?`,
      [email, nombre, username, password, rol, sucursal_id, JSON.stringify(permisos), activo, id]
    );
    
    logger.info(`✅ Usuario ${id} actualizado exitosamente`);
    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (err) {
    logger.error('❌ Error al actualizar usuario:', { 
      id: req.params.id, 
      error: err.message, 
      stack: err.stack 
    });
    res.status(500).json({ error: err.message });
  }
});

// Eliminar usuario (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`📥 Solicitud para eliminar usuario con ID: ${id}`);
    
    await runQuery('UPDATE users SET activo = 0 WHERE id = ?', [id]);
    
    logger.info(`✅ Usuario ${id} eliminado exitosamente`);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (err) {
    logger.error('❌ Error al eliminar usuario:', { 
      id: req.params.id, 
      error: err.message, 
      stack: err.stack 
    });
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    logger.info(`📥 Solicitud para iniciar sesión con email: ${email}`);
    
    const user = await runQuery(
      'SELECT * FROM users WHERE email = ? AND username = ? AND password = ? AND activo = 1',
      [email, username, password]
    );
    
    if (!user || user.length === 0) {
      logger.warn(`⚠️ Credenciales inválidas para email: ${email}`);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    logger.info(`✅ Sesión iniciada exitosamente para email: ${email}`);
    res.json(user[0]);
  } catch (err) {
    logger.error('❌ Error al iniciar sesión:', { 
      email: req.body.email, 
      error: err.message, 
      stack: err.stack 
    });
    res.status(500).json({ error: err.message });
  }
});

export default router;