import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
  try {
    console.log('🗄️ Inicializando base de datos...');

    const dbDir = join(__dirname, '..', 'data', 'db');
    const dbPath = join(dbDir, 'database.db');

    // Crear directorio si no existe
    await fs.mkdir(dbDir, { recursive: true });

    // Crear backup si existe la base de datos
    try {
      await fs.access(dbPath);
      const backupPath = `${dbPath}.backup-${Date.now()}`;
      await fs.copyFile(dbPath, backupPath);
      console.log(`📦 Backup creado en: ${backupPath}`);
    } catch {
      // No existe la base de datos, continuamos
    }

    // Crear nueva conexión
    const db = new sqlite3.Database(dbPath);

    // Crear tablas
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        // Configuración de rendimiento
        db.run('PRAGMA journal_mode = WAL');
        db.run('PRAGMA synchronous = NORMAL');
        db.run('PRAGMA foreign_keys = ON');

        // Crear tablas
        const tables = [
          `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_email TEXT NOT NULL,
            email TEXT NOT NULL,
            nombre TEXT NOT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            rol TEXT NOT NULL,
            sucursal_id INTEGER,
            permisos TEXT NOT NULL,
            activo BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(business_email, username),
            UNIQUE(business_email, email)
          )`,
          // Agregar el resto de las tablas aquí
        ];

        tables.forEach(sql => {
          db.run(sql, err => {
            if (err) reject(err);
          });
        });

        resolve();
      });
    });

    console.log('✅ Base de datos inicializada correctamente');
    db.close();

  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

initializeDatabase().catch(console.error);