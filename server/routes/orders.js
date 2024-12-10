import express from 'express';
import { db } from '../index.js';

const router = express.Router();

// Get all orders
router.get('/', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY fecha DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create order
router.post('/', (req, res) => {
  const { 
    proveedorId, 
    productos, 
    fecha, 
    fechaEntrega, 
    estado, 
    total,
    observaciones,
    sucursal,
    businessEmail
  } = req.body;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    db.run(
      `INSERT INTO orders (
        proveedor_id, fecha, fecha_entrega, estado, total, 
        observaciones, sucursal_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [proveedorId, fecha, fechaEntrega, estado, total, observaciones, sucursal],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          res.status(500).json({ error: err.message });
          return;
        }

        const orderId = this.lastID;
        let success = true;

        productos.forEach(item => {
          if (!success) return;

          db.run(
            `INSERT INTO order_items (
              order_id, product_id, cantidad, precio_unitario, subtotal
            ) VALUES (?, ?, ?, ?, ?)`,
            [orderId, item.productoId, item.cantidad, item.precioUnitario, item.subtotal],
            (err) => {
              if (err) success = false;
            }
          );
        });

        if (!success) {
          db.run('ROLLBACK');
          res.status(500).json({ error: 'Error al procesar el pedido' });
          return;
        }

        db.run('COMMIT');

        // Notify all connected clients
        req.io.to(businessEmail).emit('dataUpdated', {
          type: 'orders',
          action: 'create',
          data: {
            id: orderId,
            proveedorId,
            productos,
            fecha,
            fechaEntrega,
            estado,
            total,
            observaciones,
            sucursal
          }
        });

        res.json({
          id: orderId,
          message: 'Pedido creado exitosamente'
        });
      }
    );
  });
});

// Update order
router.put('/:id', (req, res) => {
  const { estado, businessEmail } = req.body;
  
  db.run(
    'UPDATE orders SET estado = ? WHERE id = ?',
    [estado, req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Notify update
      req.io.to(businessEmail).emit('dataUpdated', {
        type: 'orders',
        action: 'update',
        data: { id: req.params.id, estado }
      });

      res.json({ message: 'Pedido actualizado exitosamente' });
    }
  );
});

// Delete order
router.delete('/:id', (req, res) => {
  const { businessEmail } = req.query;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    db.run('DELETE FROM order_items WHERE order_id = ?', [req.params.id], (err) => {
      if (err) {
        db.run('ROLLBACK');
        res.status(500).json({ error: err.message });
        return;
      }

      db.run('DELETE FROM orders WHERE id = ?', [req.params.id], (err) => {
        if (err) {
          db.run('ROLLBACK');
          res.status(500).json({ error: err.message });
          return;
        }

        db.run('COMMIT');

        // Notify deletion
        req.io.to(businessEmail).emit('dataUpdated', {
          type: 'orders',
          action: 'delete',
          data: { id: req.params.id }
        });

        res.json({ message: 'Pedido eliminado exitosamente' });
      });
    });
  });
});

export default router;