import express from 'express';
import { db } from '../index.js';

const router = express.Router();

// Get all customers
router.get('/', (req, res) => {
  db.all('SELECT * FROM customers', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create customer
router.post('/', (req, res) => {
  const { nombre, telefono, email, businessEmail } = req.body;
  
  db.run(
    `INSERT INTO customers (nombre, telefono, email, puntos, total_gastado) 
     VALUES (?, ?, ?, 0, 0)`,
    [nombre, telefono, email],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Notify all connected clients
      req.io.to(businessEmail).emit('dataUpdated', {
        type: 'customers',
        action: 'create',
        data: { id: this.lastID, nombre, telefono, email, puntos: 0, total_gastado: 0 }
      });

      res.json({
        id: this.lastID,
        message: 'Cliente creado exitosamente'
      });
    }
  );
});

// Update customer
router.put('/:id', (req, res) => {
  const { nombre, telefono, email, puntos, total_gastado, businessEmail } = req.body;
  
  db.run(
    `UPDATE customers 
     SET nombre = ?, telefono = ?, email = ?, puntos = ?, total_gastado = ?
     WHERE id = ?`,
    [nombre, telefono, email, puntos, total_gastado, req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Notify update
      req.io.to(businessEmail).emit('dataUpdated', {
        type: 'customers',
        action: 'update',
        data: { id: req.params.id, nombre, telefono, email, puntos, total_gastado }
      });

      res.json({ message: 'Cliente actualizado exitosamente' });
    }
  );
});

// Delete customer
router.delete('/:id', (req, res) => {
  const { businessEmail } = req.query;

  db.run('DELETE FROM customers WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Notify deletion
    req.io.to(businessEmail).emit('dataUpdated', {
      type: 'customers',
      action: 'delete',
      data: { id: req.params.id }
    });

    res.json({ message: 'Cliente eliminado exitosamente' });
  });
});

export default router;