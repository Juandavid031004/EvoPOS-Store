import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DB_PATH || join(__dirname, '..', 'data', 'database.db');

logger.debug(`📂 Ruta de la base de datos: ${dbPath}`);

let database = null;

export const initializeDatabase = () => {
  if (database) {
    logger.debug('🔄 Reutilizando conexión existente a la base de datos');
    return database;
  }

  logger.info('🔌 Iniciando conexión a la base de datos...');
  
  database = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      logger.error('❌ Error al conectar con la base de datos:', { error: err.message, stack: err.stack });
      process.exit(1);
    }
    logger.info('✅ Conexión exitosa con la base de datos SQLite');
  });

  database.serialize(() => {
    logger.debug('⚙️ Configurando parámetros de la base de datos...');
    database.run('PRAGMA journal_mode = WAL');
    database.run('PRAGMA synchronous = NORMAL');
    database.run('PRAGMA foreign_keys = ON');
    logger.debug('✅ Parámetros de la base de datos configurados');
  });

  process.on('SIGINT', () => {
    logger.info('🔄 Cerrando conexión a la base de datos...');
    database.close((err) => {
      if (err) {
        logger.error('❌ Error al cerrar la base de datos:', { error: err.message, stack: err.stack });
      } else {
        logger.info('✅ Base de datos cerrada correctamente');
      }
      process.exit(0);
    });
  });

  return database;
};

export const getDatabase = () => {
  if (!database) {
    logger.debug('🔄 Inicializando nueva conexión a la base de datos');
    database = initializeDatabase();
  }
  return database;
};

// Función de utilidad para ejecutar consultas con logs
export const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    logger.debug('🔍 Ejecutando consulta SQL:', { sql, params });
    
    const db = getDatabase();
    db.all(sql, params, (err, rows) => {
      if (err) {
        logger.error('❌ Error en consulta SQL:', { 
          sql, 
          params, 
          error: err.message, 
          stack: err.stack 
        });
        reject(err);
      } else {
        logger.debug('✅ Consulta SQL exitosa:', { 
          sql, 
          params, 
          rowCount: rows?.length 
        });
        resolve(rows);
      }
    });
  });
};