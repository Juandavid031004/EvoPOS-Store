import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', 'data', 'database.db');

const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando base de datos SQLite...\n');

// Verificar tablas existentes
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
        console.error('❌ Error al consultar tablas:', err);
        return;
    }
    console.log('📋 Tablas encontradas:', tables.map(t => t.name).join(', '), '\n');

    // Verificar datos en cada tabla
    tables.forEach(table => {
        db.all(`SELECT COUNT(*) as count FROM ${table.name}`, [], (err, result) => {
            if (err) {
                console.error(`❌ Error al consultar ${table.name}:`, err);
                return;
            }
            console.log(`📊 Registros en ${table.name}: ${result[0].count}`);
            
            // Mostrar muestra de datos si hay registros
            if (result[0].count > 0) {
                db.all(`SELECT * FROM ${table.name} LIMIT 1`, [], (err, rows) => {
                    if (err) {
                        console.error(`❌ Error al obtener muestra de ${table.name}:`, err);
                        return;
                    }
                    console.log(`📝 Muestra de ${table.name}:`, rows[0], '\n');
                });
            } else {
                console.log(`⚠️ La tabla ${table.name} está vacía\n`);
            }
        });
    });
});

// Cerrar conexión después de 2 segundos para dar tiempo a las consultas asíncronas
setTimeout(() => {
    db.close((err) => {
        if (err) {
            console.error('❌ Error al cerrar la base de datos:', err);
        } else {
            console.log('\n✅ Verificación completada');
        }
    });
}, 2000);
