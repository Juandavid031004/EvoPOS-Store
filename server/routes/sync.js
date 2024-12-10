import express from 'express';
import { databaseService } from '../services/database.js';
import { getIO } from '../services/socket.js';

const router = express.Router();

// Ruta para sincronización inicial
router.post('/init', async (req, res) => {
  const { businessEmail } = req.body;
  
  try {
    const data = await databaseService.transaction(async () => {
      const [products, sales, customers, users, expenses] = await Promise.all([
        databaseService.query('SELECT * FROM products WHERE business_email = ?', [businessEmail]),
        databaseService.query('SELECT * FROM sales WHERE business_email = ?', [businessEmail]),
        databaseService.query('SELECT * FROM customers WHERE business_email = ?', [businessEmail]),
        databaseService.query('SELECT * FROM users WHERE business_email = ?', [businessEmail]),
        databaseService.query('SELECT * FROM expenses WHERE business_email = ?', [businessEmail])
      ]);

      return {
        products,
        sales,
        customers,
        users,
        expenses
      };
    });

    res.json(data);
  } catch (error) {
    console.error('Error en sincronización inicial:', error);
    res.status(500).json({ error: 'Error en sincronización' });
  }
});

// Ruta para actualizar datos
router.post('/update', async (req, res) => {
  const { type, action, data, businessEmail } = req.body;

  try {
    await databaseService.transaction(async () => {
      switch (type) {
        case 'products':
          await handleProductUpdate(action, data, businessEmail);
          break;
        case 'sales':
          await handleSaleUpdate(action, data, businessEmail);
          break;
        case 'customers':
          await handleCustomerUpdate(action, data, businessEmail);
          break;
        case 'expenses':
          await handleExpenseUpdate(action, data, businessEmail);
          break;
      }
    });

    // Notificar a todos los clientes conectados
    const io = getIO();
    io.to(businessEmail).emit('dataUpdated', { type, action, data });

    res.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar datos:', error);
    res.status(500).json({ error: 'Error al actualizar datos' });
  }
});

// Funciones auxiliares para manejar actualizaciones
async function handleProductUpdate(action, data, businessEmail) {
  switch (action) {
    case 'create':
      await databaseService.run(
        `INSERT INTO products (
          business_email, codigo, nombre, descripcion, precio, 
          costo, categoria, sucursal_id, stock, stock_minimo, imagen
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          businessEmail, data.codigo, data.nombre, data.descripcion,
          data.precio, data.costo, data.categoria, data.sucursal_id,
          data.stock, data.stock_minimo, data.imagen
        ]
      );
      break;

    case 'update':
      await databaseService.run(
        `UPDATE products SET 
          nombre = ?, descripcion = ?, precio = ?, costo = ?,
          categoria = ?, sucursal_id = ?, stock = ?, stock_minimo = ?,
          imagen = ?
        WHERE id = ? AND business_email = ?`,
        [
          data.nombre, data.descripcion, data.precio, data.costo,
          data.categoria, data.sucursal_id, data.stock, data.stock_minimo,
          data.imagen, data.id, businessEmail
        ]
      );
      break;

    case 'delete':
      await databaseService.run(
        'DELETE FROM products WHERE id = ? AND business_email = ?',
        [data.id, businessEmail]
      );
      break;
  }
}

async function handleSaleUpdate(action, data, businessEmail) {
  switch (action) {
    case 'create':
      const saleResult = await databaseService.run(
        `INSERT INTO sales (
          business_email, cliente_id, vendedor_id, subtotal,
          descuento, total, metodo_pago, sucursal_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          businessEmail, data.cliente_id, data.vendedor_id,
          data.subtotal, data.descuento, data.total,
          data.metodo_pago, data.sucursal_id
        ]
      );

      // Insertar items de la venta
      for (const item of data.productos) {
        await databaseService.run(
          `INSERT INTO sale_items (
            sale_id, product_id, cantidad, precio_unitario, subtotal
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            saleResult.id, item.productoId, item.cantidad,
            item.precioUnitario, item.subtotal
          ]
        );

        // Actualizar stock
        await databaseService.run(
          `UPDATE products 
           SET stock = stock - ? 
           WHERE id = ? AND business_email = ?`,
          [item.cantidad, item.productoId, businessEmail]
        );
      }
      break;

    case 'delete':
      // Restaurar stock
      const items = await databaseService.query(
        'SELECT * FROM sale_items WHERE sale_id = ?',
        [data.id]
      );

      for (const item of items) {
        await databaseService.run(
          `UPDATE products 
           SET stock = stock + ? 
           WHERE id = ? AND business_email = ?`,
          [item.cantidad, item.product_id, businessEmail]
        );
      }

      // Eliminar venta y sus items
      await databaseService.run(
        'DELETE FROM sale_items WHERE sale_id = ?',
        [data.id]
      );
      await databaseService.run(
        'DELETE FROM sales WHERE id = ? AND business_email = ?',
        [data.id, businessEmail]
      );
      break;
  }
}

async function handleCustomerUpdate(action, data, businessEmail) {
  switch (action) {
    case 'create':
      await databaseService.run(
        `INSERT INTO customers (
          business_email, nombre, telefono, email, puntos, total_gastado
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          businessEmail, data.nombre, data.telefono,
          data.email, data.puntos, data.total_gastado
        ]
      );
      break;

    case 'update':
      await databaseService.run(
        `UPDATE customers SET 
          nombre = ?, telefono = ?, email = ?,
          puntos = ?, total_gastado = ?
        WHERE id = ? AND business_email = ?`,
        [
          data.nombre, data.telefono, data.email,
          data.puntos, data.total_gastado, data.id, businessEmail
        ]
      );
      break;

    case 'delete':
      await databaseService.run(
        'DELETE FROM customers WHERE id = ? AND business_email = ?',
        [data.id, businessEmail]
      );
      break;
  }
}

async function handleExpenseUpdate(action, data, businessEmail) {
  switch (action) {
    case 'create':
      await databaseService.run(
        `INSERT INTO expenses (
          business_email, descripcion, monto, tipo, fecha,
          comprobante, sucursal_id, responsable, estado, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          businessEmail, data.descripcion, data.monto, data.tipo,
          data.fecha, data.comprobante, data.sucursal_id,
          data.responsable, data.estado, data.observaciones
        ]
      );
      break;

    case 'update':
      await databaseService.run(
        `UPDATE expenses SET 
          descripcion = ?, monto = ?, tipo = ?, fecha = ?,
          comprobante = ?, sucursal_id = ?, responsable = ?,
          estado = ?, observaciones = ?
        WHERE id = ? AND business_email = ?`,
        [
          data.descripcion, data.monto, data.tipo, data.fecha,
          data.comprobante, data.sucursal_id, data.responsable,
          data.estado, data.observaciones, data.id, businessEmail
        ]
      );
      break;

    case 'delete':
      await databaseService.run(
        'DELETE FROM expenses WHERE id = ? AND business_email = ?',
        [data.id, businessEmail]
      );
      break;
  }
}

export default router;