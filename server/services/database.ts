import { db } from '../config/database.js';

class DatabaseService {
  static async query(sql: string, params: any[] = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Error en consulta:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async run(sql: string, params: any[] = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          console.error('Error al ejecutar:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  static async transaction<T>(callback: () => Promise<T>): Promise<T> {
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

  static async get(sql: string, params: any[] = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Error al obtener:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
}

export const databaseService = DatabaseService;