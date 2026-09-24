const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Limitador global de peticiones (Protección contra DoS general)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Demasiadas solicitudes desde esta dirección IP. Por favor intente más tarde.'
  }
});

// Limitador para creación de reportes
const createReportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Has alcanzado el límite de reportes permitidos. Intenta más tarde.'
  }
});

// Limitador para comentarios vecinales
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Límite de comentarios excedido. Por favor aguarde unos minutos.'
  }
});

// Limitador para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Demasiados intentos de inicio de sesión fallidos. Acceso bloqueado temporalmente.'
  }
});

module.exports = {
  globalLimiter,
  createReportLimiter,
  commentLimiter,
  authLimiter
};
