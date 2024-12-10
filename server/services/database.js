import sqlite3 from 'sqlite3';
import { logger } from '../config/logger.js';

class DatabaseService {
  static async query(sql, params = [], businessEmail = null) {
    if (businessEmail) {
      params = [businessEmail, ...params];
      sql = sql.replace(/WHERE/i, 'WHERE business_email = ? AND');
    }

    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Error en consulta:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async run(sql, params = [], businessEmail = null) {
    if (businessEmail) {
      params = [businessEmail, ...params];
      sql = sql.replace(/VALUES/, 'VALUES (?, ');
    }

    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          logger.error('Error al ejecutar:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  static async transaction(callback) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        Promise.resolve(callback())
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

  static async get(sql, params = [], businessEmail = null) {
    if (businessEmail) {
      params = [businessEmail, ...params];
      sql = sql.replace(/WHERE/i, 'WHERE business_email = ? AND');
    }

    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          logger.error('Error al obtener:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
}

export const databaseService = DatabaseService;