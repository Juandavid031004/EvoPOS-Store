import { socketService } from './socket.js';
import { databaseService } from './database.js';

class SyncService {
  static async syncData(businessEmail: string) {
    try {
      const [products, sales, customers] = await Promise.all([
        databaseService.query('SELECT * FROM products WHERE business_email = ?', [businessEmail]),
        databaseService.query('SELECT * FROM sales WHERE business_email = ?', [businessEmail]),
        databaseService.query('SELECT * FROM customers WHERE business_email = ?', [businessEmail])
      ]);

      socketService.emitToBusinessRoom(businessEmail, 'syncData', {
        products,
        sales,
        customers
      });

      return { products, sales, customers };
    } catch (error) {
      console.error('Error en sincronización:', error);
      throw error;
    }
  }

  static async handleDataUpdate(update: any) {
    const { type, action, data, businessEmail } = update;

    try {
      await databaseService.transaction(async () => {
        switch (type) {
          case 'products':
            await this.handleProductUpdate(action, data, businessEmail);
            break;
          case 'sales':
            await this.handleSaleUpdate(action, data, businessEmail);
            break;
          case 'customers':
            await this.handleCustomerUpdate(action, data, businessEmail);
            break;
        }
      });

      // Notificar a todos los clientes conectados
      socketService.emitToBusinessRoom(businessEmail, 'dataUpdated', update);
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      throw error;
    }
  }

  private static async handleProductUpdate(action: string, data: any, businessEmail: string) {
    switch (action) {
      case 'create':
        await databaseService.run(
          'INSERT INTO products (codigo, nombre, stock, business_email) VALUES (?, ?, ?, ?)',
          [data.codigo, data.nombre, data.stock, businessEmail]
        );
        break;
      case 'update':
        await databaseService.run(
          'UPDATE products SET stock = ? WHERE id = ? AND business_email = ?',
          [data.stock, data.id, businessEmail]
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

  private static async handleSaleUpdate(action: string, data: any, businessEmail: string) {
    // Implementar lógica para ventas
  }

  private static async handleCustomerUpdate(action: string, data: any, businessEmail: string) {
    // Implementar lógica para clientes
  }
}

export const syncService = SyncService;