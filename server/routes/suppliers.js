import express from 'express';
import { db } from '../index.js';

const router = express.Router();

// Get all suppliers
router.get('/', (req, res) => {
  db.all('SELECT * FROM suppliers', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create supplier
router.post('/', (req, res) => {
  const {
    nombre,
    ruc,
    direccion,
    telefono,
    email,
    contacto,
    productos,
    activo,
    businessEmail
  } = req.body;

  db.run(
    `INSERT INTO suppliers (
      nombre, ruc, direccion, telefono, email,
      contacto, productos, activo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, ruc, direccion, telefono, email, contacto, JSON.stringify(productos), activo],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Notify all connected clients
      req.io.to(businessEmail).emit('dataUpdated', {
        type: 'suppliers',
        action: 'create',
        data: {
          id: this.lastID,
          nombre,
          ruc,
          direccion,
          telefono,
          email,
          contacto,
          productos,
          activo
        }
      });

      res.json({
        id: this.lastID,
        message: 'Proveedor creado exitosamente'
      });
    }
  );
});

// Update supplier
router.put('/:id', (req, res) => {
  const {
    nombre,
    ruc,
    direccion,
    telefono,
    email,
    contacto,
    productos,
    activo,
    businessEmail
  } = req.body;

  db.run(
    `UPDATE suppliers 
     SET nombre = ?, ruc = ?, direccion = ?, telefono = ?,
         email = ?, contacto = ?, productos = ?, activo = ?
     WHERE id = ?`,
    [nombre, ruc, direccion, telefono, email, contacto, JSON.stringify(productos), activo, req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Notify update
      req.io.to(businessEmail).emit('dataUpdated', {
        type: 'suppliers',
        action: 'update',
        data: {
          id: req.params.id,
          nombre,
          ruc,
          direccion,
          telefono,
          email,
          contacto,
          productos,
          activo
        }
      });

      res.json({ message: 'Proveedor actualizado exitosamente' });
    }
  );
});

// Delete supplier
router.delete('/:id', (req, res) => {
  const { businessEmail } = req.query;

  db.run('DELETE FROM suppliers WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Notify deletion
    req.io.to(businessEmail).emit('dataUpdated', {
      type: 'suppliers',
      action: 'delete',
      data: { id: req.params.id }
    });

    res.json({ message: 'Proveedor eliminado exitosamente' });
  });
});

export default router;