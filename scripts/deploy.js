import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

async function deploy() {
  try {
    console.log('🚀 Iniciando despliegue...');

    // Verificar requisitos
    await checkRequirements();

    // Construir la aplicación
    console.log('📦 Construyendo la aplicación...');
    await execAsync('npm run build');

    // Crear directorios necesarios
    await createDirectories();

    // Configurar PM2
    await setupPM2();

    // Iniciar servicios
    await startServices();

    console.log('🎉 Despliegue completado exitosamente!');
    console.log('📊 Estado del sistema:');
    await execAsync('pm2 list');

  } catch (error) {
    console.error('❌ Error en el despliegue:', error.message);
    process.exit(1);
  }
}

async function checkRequirements() {
  console.log('🔍 Verificando requisitos...');

  try {
    await execAsync('pm2 --version');
  } catch {
    console.log('📥 Instalando PM2...');
    await execAsync('npm install -g pm2');
  }

  // Verificar node_modules
  try {
    await fs.access('node_modules');
  } catch {
    console.log('📥 Instalando dependencias...');
    await execAsync('npm install');
  }
}

async function createDirectories() {
  console.log('📁 Creando directorios...');
  
  const dirs = ['data', 'data/db', 'logs'];
  
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function setupPM2() {
  console.log('⚙️ Configurando PM2...');

  const pm2Config = {
    apps: [
      {
        name: 'evopos-server',
        script: 'server/index.js',
        instances: 'max',
        exec_mode: 'cluster',
        watch: false,
        max_memory_restart: '1G',
        env: {
          NODE_ENV: 'production',
          PORT: 3000,
          DB_PATH: path.join(process.cwd(), 'data/db/database.db')
        },
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        error_file: 'logs/error.log',
        out_file: 'logs/out.log',
        merge_logs: true
      }
    ]
  };

  await fs.writeFile('ecosystem.config.json', JSON.stringify(pm2Config, null, 2));
}

async function startServices() {
  console.log('🚀 Iniciando servicios...');

  // Detener instancias previas
  try {
    await execAsync('pm2 delete all');
  } catch {
    // Ignorar si no hay instancias previas
  }

  // Iniciar nueva instancia
  await execAsync('pm2 start ecosystem.config.json');
  await execAsync('pm2 save');

  console.log('✅ Servicios iniciados correctamente');
}

deploy().catch(console.error);