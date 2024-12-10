import express from 'express';
import { db } from '../index.js';

const router = express.Router();

// Get all sales
router.get('/', (req, res) => {
  const { start_date, end_date, sucursal_id } = req.query;
  let query = 'SELECT * FROM sales';
  let params = [];
  let conditions = [];

  if (start_date) {
    conditions.push('fecha >= ?');
    params.push(start_date);
  }
  if (end_date) {
    conditions.push('fecha <= ?');
    params.push(end_date);
  }
  if (sucursal_id) {
    conditions.push('sucursal_id = ?');
    params.push(sucursal_id);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY fecha DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create sale
router.post('/', (req, res) => {
  const {
    cliente_id,
    vendedor_id,
    subtotal,
    descuento,
    total,
    metodo_pago,
    sucursal_id,
    items,
    businessEmail
  } = req.body;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    db.run(
      `INSERT INTO sales (
        cliente_id, vendedor_id, subtotal, descuento,
        total, metodo_pago, sucursal_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cliente_id, vendedor_id, subtotal, descuento,
       total, metodo_pago, sucursal_id],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          res.status(500).json({ error: err.message });
          return;
        }

        const sale_id = this.lastID;
        let success = true;

        // Insert items and update stock
        items.forEach(item => {
          if (!success) return;

          db.run(
            `INSERT INTO sale_items (
              sale_id, product_id, cantidad,
              precio_unitario, subtotal
            ) VALUES (?, ?, ?, ?, ?)`,
            [sale_id, item.product_id, item.cantidad,
             item.precio_unitario, item.subtotal],
            (err) => {
              if (err) {
                success = false;
                return;
              }

              // Update stock
              db.run(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.cantidad, item.product_id],
                (err) => {
                  if (err) success = false;
                }
              );
            }
          );
        });

        if (!success) {
          db.run('ROLLBACK');
          res.status(500).json({ error: 'Error al procesar la venta' });
          return;
        }

        db.run('COMMIT');

        // Notify all connected clients
        req.io.to(businessEmail).emit('dataUpdated', {
          type: 'sales',
          action: 'create',
          data: {
            id: sale_id,
            cliente_id,
            vendedor_id,
            subtotal,
            descuento,
            total,
            metodo_pago,
            sucursal_id,
            items
          }
        });

        res.json({
          id: sale_id,
          message: 'Venta registrada exitosamente'
        });
      }
    );
  });
});

// Delete sale
router.delete('/:id', (req, res) => {
  const { businessEmail } = req.query;
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Get sale items to restore stock
    db.all(
      'SELECT * FROM sale_items WHERE sale_id = ?',
      [req.params.id],
      (err, items) => {
        if (err) {
          db.run('ROLLBACK');
          res.status(500).json({ error: err.message });
          return;
        }

        let success = true;

        // Restore stock
        items.forEach(item => {
          if (!success) return;

          db.run(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
            [item.cantidad, item.product_id],
            (err) => {
              if (err) success = false;
            }
          );
        });

        if (!success) {
          db.run('ROLLBACK');
          res.status(500).json({ error: 'Error al restaurar stock' });
          return;
        }

        // Delete items and sale
        db.run(
          'DELETE FROM sale_items WHERE sale_id = ?',
          [req.params.id],
          (err) => {
            if (err) {
              db.run('ROLLBACK');
              res.status(500).json({ error: err.message });
              return;
            }

            db.run(
              'DELETE FROM sales WHERE id = ?',
              [req.params.id],
              (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  res.status(500).json({ error: err.message });
                  return;
                }

                db.run('COMMIT');

                // Notify all connected clients
                req.io.to(businessEmail).emit('dataUpdated', {
                  type: 'sales',
                  action: 'delete',
                  data: { id: req.params.id }
                });

                res.json({ message: 'Venta anulada exitosamente' });
              }
            );
          }
        );
      }
    );
  });
});

export default router;