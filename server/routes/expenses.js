import express from 'express';
import { db } from '../index.js';

const router = express.Router();

// Get all expenses
router.get('/', (req, res) => {
  db.all('SELECT * FROM expenses ORDER BY fecha DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create expense
router.post('/', (req, res) => {
  const {
    descripcion,
    monto,
    tipo,
    fecha,
    comprobante,
    sucursal,
    responsable,
    estado,
    observaciones,
    businessEmail
  } = req.body;

  db.run(
    `INSERT INTO expenses (
      descripcion, monto, tipo, fecha, comprobante,
      sucursal_id, responsable_id, estado, observaciones
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [descripcion, monto, tipo, fecha, comprobante, sucursal, responsable, estado, observaciones],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Notify all connected clients
      req.io.to(businessEmail).emit('dataUpdated', {
        type: 'expenses',
        action: 'create',
        data: {
          id: this.lastID,
          descripcion,
          monto,
          tipo,
          fecha,
          comprobante,
          sucursal,
          responsable,
          estado,
          observaciones
        }
      });

      res.json({
        id: this.lastID,
        message: 'Gasto registrado exitosamente'
      });
    }
  );
});

// Update expense
router.put('/:id', (req, res) => {
  const {
    descripcion,
    monto,
    tipo,
    fecha,
    comprobante,
    sucursal,
    responsable,
    estado,
    observaciones,
    businessEmail
  } = req.body;

  db.run(
    `UPDATE expenses 
     SET descripcion = ?, monto = ?, tipo = ?, fecha = ?,
         comprobante = ?, sucursal_id = ?, responsable_id = ?,
         estado = ?, observaciones = ?
     WHERE id = ?`,
    [descripcion, monto, tipo, fecha, comprobante, sucursal, responsable,
     estado, observaciones, req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Notify update
      req.io.to(businessEmail).emit('dataUpdated', {
        type: 'expenses',
        action: 'update',
        data: {
          id: req.params.id,
          descripcion,
          monto,
          tipo,
          fecha,
          comprobante,
          sucursal,
          responsable,
          estado,
          observaciones
        }
      });

      res.json({ message: 'Gasto actualizado exitosamente' });
    }
  );
});

// Delete expense
router.delete('/:id', (req, res) => {
  const { businessEmail } = req.query;

  db.run('DELETE FROM expenses WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Notify deletion
    req.io.to(businessEmail).emit('dataUpdated', {
      type: 'expenses',
      action: 'delete',
      data: { id: req.params.id }
    });

    res.json({ message: 'Gasto eliminado exitosamente' });
  });
});

export default router;