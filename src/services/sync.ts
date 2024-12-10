import { socketService } from './socket';
import { databaseService } from './database';

export const syncService = {
  async syncData(businessEmail: string) {
    try {
      // Obtener datos del servidor
      const [products, sales, customers] = await Promise.all([
        databaseService.query('SELECT * FROM products'),
        databaseService.query('SELECT * FROM sales'),
        databaseService.query('SELECT * FROM customers')
      ]);

      // Emitir datos al socket
      socketService.emitUpdate('sync', 'full', {
        products,
        sales,
        customers,
        businessEmail
      });

      return { products, sales, customers };
    } catch (error) {
      console.error('Error syncing data:', error);
      throw error;
    }
  },

  async handleDataUpdate(update: any) {
    const { type, action, data } = update;

    try {
      switch (type) {
        case 'products':
          await this.handleProductUpdate(action, data);
          break;
        case 'sales':
          await this.handleSaleUpdate(action, data);
          break;
        case 'customers':
          await this.handleCustomerUpdate(action, data);
          break;
      }
    } catch (error) {
      console.error('Error handling data update:', error);
      throw error;
    }
  },

  private async handleProductUpdate(action: string, data: any) {
    switch (action) {
      case 'create':
        await databaseService.run(
          'INSERT INTO products (codigo, nombre, stock) VALUES (?, ?, ?)',
          [data.codigo, data.nombre, data.stock]
        );
        break;
      case 'update':
        await databaseService.run(
          'UPDATE products SET stock = ? WHERE id = ?',
          [data.stock, data.id]
        );
        break;
      case 'delete':
        await databaseService.run(
          'DELETE FROM products WHERE id = ?',
          [data.id]
        );
        break;
    }
  },

  private async handleSaleUpdate(action: string, data: any) {
    // Similar al handleProductUpdate pero para ventas
  },

  private async handleCustomerUpdate(action: string, data: any) {
    // Similar al handleProductUpdate pero para clientes
  }
};