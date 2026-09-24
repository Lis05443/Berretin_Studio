const path = require('path');
const fs = require('fs');

// Carpeta raíz del backend (donde están server.js y package.json).
// Todas las rutas relativas del .env se resuelven contra esta carpeta, así
// la base de datos y las fotos siempre son las mismas sin importar desde
// qué carpeta se ejecute "node server.js".
const backendRoot = path.resolve(__dirname, '../..');

let DatabaseSync;
try {
  ({ DatabaseSync } = require('node:sqlite'));
} catch (err) {
  console.error('');
  console.error('==================================================================');
  console.error(' ERROR: esta versión de Node.js (' + process.version + ') no incluye SQLite.');
  console.error(' Se necesita Node.js 22.13 o superior (recomendado: la versión LTS).');
  console.error(' Descargala desde https://nodejs.org y volvé a iniciar el sistema.');
  console.error(' (En Node 22.5 a 22.12 se puede probar: node --experimental-sqlite server.js)');
  console.error('==================================================================');
  console.error('');
  process.exit(1);
}

const dbPath = path.resolve(backendRoot, process.env.DB_PATH || 'src/database/reportes_barriales.sqlite');
const dbDir = path.dirname(dbPath);

// Asegurar que el directorio de la base de datos exista
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Inicializar conexión con SQLite en modo sincrónico/seguro
const db = new DatabaseSync(dbPath);

// Configuración de PRAGMAs para integridad y rendimiento concurrente
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA busy_timeout = 5000;');

module.exports = db;
