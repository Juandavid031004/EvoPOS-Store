import { db } from '../config/database';

export const databaseService = {
  // Operaciones generales
  async query(sql: string, params: any[] = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  async run(sql: string, params: any[] = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },

  // Transacciones
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        callback()
          .then((result) => {
            db.run('COMMIT');
            resolve(result);
          })
          .catch((error) => {
            db.run('ROLLBACK');
            reject(error);
          });
      });
    });
  }
};