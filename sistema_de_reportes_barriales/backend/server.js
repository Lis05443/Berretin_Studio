const app = require('./src/app');
const initDb = require('./src/database/initDb');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

// Inicializar y verificar integridad de base de datos SQL antes de abrir el servidor
try {
  initDb();
  logger.info('Base de datos SQL conectada y lista.');
} catch (err) {
  logger.error('Error crítico al inicializar la base de datos SQL:', err);
  process.exit(1);
}

const server = app.listen(PORT, () => {
  logger.info(`=======================================================`);
  logger.info(` SISTEMA DE REPORTES BARRIALES - SERVIDOR COMUNAL`);
  logger.info(` Enlace del Servidor: http://localhost:${PORT}`);
  logger.info(` Entorno: ${process.env.NODE_ENV || 'development'}`);
  logger.info(` Seguridad Activa: Helmet, CORS, Rate Limiters, SQL Sanitizer`);
  logger.info(`=======================================================`);
});

// Cierre ordenado ante señales de terminación
function gracefulShutdown(signal) {
  logger.info(`Señal ${signal} recibida. Cerrando conexiones HTTP...`);
  server.close(() => {
    logger.info('Servidor finalizado de manera segura.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
