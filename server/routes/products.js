import express from 'express';
import { db } from '../index.js';

const router = express.Router();

// Obtener todos los productos
router.get('/', (req, res) => {
  const sucursal_id = req.query.sucursal_id;
  let query = 'SELECT * FROM products';
  let params = [];

  if (sucursal_id) {
    query += ' WHERE sucursal_id = ?';
    params.push(sucursal_id);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Crear producto
router.post('/', (req, res) => {
  const {
    codigo,
    nombre,
    descripcion,
    precio,
    costo,
    categoria,
    sucursal_id,
    stock,
    stock_minimo,
    imagen
  } = req.body;
  
  db.run(
    `INSERT INTO products (
      codigo, nombre, descripcion, precio, costo, categoria,
      sucursal_id, stock, stock_minimo, imagen
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [codigo, nombre, descripcion, precio, costo, categoria,
     sucursal_id, stock, stock_minimo, imagen],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Notificar a todos los clientes conectados
      req.io.to(req.body.businessEmail).emit('dataUpdated', {
        type: 'products',
        action: 'create',
        data: {
          id: this.lastID,
          codigo,
          nombre,
          descripcion,
          precio,
          costo,
          categoria,
          sucursal_id,
          stock,
          stock_minimo,
          imagen
        }
      });

      res.json({
        id: this.lastID,
        message: 'Producto creado exitosamente'
      });
    }
  );
});

// Actualizar producto
router.put('/:id', (req, res) => {
  const {
    codigo,
    nombre,
    descripcion,
    precio,
    costo,
    categoria,
    sucursal_id,
    stock,
    stock_minimo,
    imagen,
    businessEmail
  } = req.body;
  
  db.run(
    `UPDATE products 
     SET codigo = ?, nombre = ?, descripcion = ?, precio = ?,
         costo = ?, categoria = ?, sucursal_id = ?, stock = ?,
         stock_minimo = ?, imagen = ?
     WHERE id = ?`,
    [codigo, nombre, descripcion, precio, costo, categoria,
     sucursal_id, stock, stock_minimo, imagen, req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Notificar actualización
      req.io.to(businessEmail).emit('dataUpdated', {
        type: 'products',
        action: 'update',
        data: {
          id: req.params.id,
          codigo,
          nombre,
          descripcion,
          precio,
          costo,
          categoria,
          sucursal_id,
          stock,
          stock_minimo,
          imagen
        }
      });

      res.json({ message: 'Producto actualizado exitosamente' });
    }
  );
});

// Eliminar producto
router.delete('/:id', (req, res) => {
  const { businessEmail } = req.query;

  db.run('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Notificar eliminación
    req.io.to(businessEmail).emit('dataUpdated', {
      type: 'products',
      action: 'delete',
      data: { id: req.params.id }
    });

    res.json({ message: 'Producto eliminado exitosamente' });
  });
});

export default router;