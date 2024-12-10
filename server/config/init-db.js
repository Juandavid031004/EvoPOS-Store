import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
  try {
    console.log('🗄️ Inicializando base de datos...');

    const dbDir = join(__dirname, '..', 'data');
    const dbPath = join(dbDir, 'database.db');

    await fs.mkdir(dbDir, { recursive: true });

    const db = new sqlite3.Database(dbPath);

    await new Promise((resolve, reject) => {
      db.serialize(() => {
        // Configuración de rendimiento
        db.run('PRAGMA journal_mode = WAL');
        db.run('PRAGMA synchronous = NORMAL');
        db.run('PRAGMA foreign_keys = ON');

        // Tablas principales
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
          `CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_email TEXT NOT NULL,
            codigo TEXT NOT NULL,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            precio REAL NOT NULL,
            costo REAL NOT NULL,
            categoria TEXT,
            sucursal_id INTEGER,
            stock INTEGER DEFAULT 0,
            stock_minimo INTEGER DEFAULT 5,
            imagen TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(business_email, codigo)
          )`,
          `CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_email TEXT NOT NULL,
            cliente_id INTEGER,
            vendedor_id INTEGER NOT NULL,
            subtotal REAL NOT NULL,
            descuento REAL DEFAULT 0,
            total REAL NOT NULL,
            metodo_pago TEXT NOT NULL,
            sucursal_id INTEGER,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(vendedor_id) REFERENCES users(id)
          )`,
          `CREATE TABLE IF NOT EXISTS sale_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            cantidad INTEGER NOT NULL,
            precio_unitario REAL NOT NULL,
            subtotal REAL NOT NULL,
            FOREIGN KEY(sale_id) REFERENCES sales(id) ON DELETE CASCADE,
            FOREIGN KEY(product_id) REFERENCES products(id)
          )`,
          `CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_email TEXT NOT NULL,
            nombre TEXT NOT NULL,
            telefono TEXT,
            email TEXT,
            puntos INTEGER DEFAULT 0,
            total_gastado REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`
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