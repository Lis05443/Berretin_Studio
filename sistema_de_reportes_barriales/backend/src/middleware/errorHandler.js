const multer = require('multer');
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  // Manejo de errores de carga de archivos (Multer)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'La fotografía excede el tamaño máximo permitido de 10 MB.'
      });
    }
    return res.status(400).json({
      status: 'error',
      message: `Error al procesar archivo adjunto: ${err.message}`
    });
  }

  // Error de formato de archivo no permitido
  if (err.status === 400 && err.message) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  // Errores de sintaxis en JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'El formato del cuerpo de la petición JSON es inválido.'
    });
  }

  // Errores de la base de datos SQLite (node:sqlite): traducirlos a un mensaje útil
  if (err && err.code === 'ERR_SQLITE_ERROR') {
    const detail = `${err.errstr || ''} ${err.message || ''}`.toLowerCase();
    logger.error('Error de base de datos SQLite:', err);

    let message = 'No se pudo guardar en la base de datos.';
    if (detail.includes('readonly')) {
      message = 'La base de datos es de solo lectura. Verificá que el proyecto esté descomprimido en una carpeta con permisos de escritura (no dentro del .zip) y que los archivos .sqlite/.sqlite-wal/.sqlite-shm no estén bloqueados.';
    } else if (detail.includes('locked') || detail.includes('busy')) {
      message = 'La base de datos está bloqueada por otro proceso. Cerrá otras copias del servidor o programas que la tengan abierta (DBeaver, etc.) e intentá de nuevo.';
    } else if (detail.includes('malformed') || detail.includes('not a database')) {
      message = 'El archivo de la base de datos está dañado. Borrá los archivos reportes_barriales.sqlite* de backend/src/database y reiniciá el servidor para regenerarla.';
    } else if (detail.includes('no such table')) {
      message = 'Faltan tablas en la base de datos. Reiniciá el servidor (o ejecutá "npm run init-db") para crearlas.';
    } else if (detail.includes('constraint')) {
      message = 'Los datos enviados no cumplen las reglas de la base de datos (' + (err.message || 'restricción') + ').';
    }
    return res.status(500).json({ status: 'error', message });
  }

  // Registrar error interno en el servidor sin exponerlo al cliente
  logger.error('Excepción no controlada en el servidor:', err);

  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    status: 'error',
    message: isProduction || statusCode === 500
      ? 'Ocurrió un error interno en el servidor comunal. Por favor intente más tarde.'
      : err.message
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    status: 'error',
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
