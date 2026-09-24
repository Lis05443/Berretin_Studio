const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_civic_key_municipio_2024';

/**
 * Middleware para requerir autenticación JWT
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['x-access-token'];

  if (!authHeader) {
    return res.status(401).json({
      status: 'error',
      message: 'Acceso no autorizado. Se requiere token de autenticación.'
    });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    logger.security('INVALID_TOKEN_ATTEMPT', { ip: req.ip, error: err.message });
    return res.status(401).json({
      status: 'error',
      message: 'Token de sesión inválido o expirado.'
    });
  }
}

/**
 * Middleware para verificar si el usuario tiene uno de los roles permitidos
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      logger.security('UNAUTHORIZED_ROLE_ACCESS', {
        user: req.user?.username,
        role: req.user?.role,
        requiredRoles: allowedRoles,
        path: req.originalUrl
      });
      return res.status(403).json({
        status: 'error',
        message: 'No posee los permisos operativos suficientes para realizar esta acción.'
      });
    }
    next();
  };
}

/**
 * Middleware opcional: si hay token lo decodifica, si no, continúa como anónimo
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
}

module.exports = {
  verifyToken,
  requireRole,
  optionalAuth
};
