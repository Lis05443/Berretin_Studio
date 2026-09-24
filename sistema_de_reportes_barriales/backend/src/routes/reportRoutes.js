const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { createReportLimiter } = require('../middleware/rateLimiter');
const sanitizeMiddleware = require('../middleware/sanitize');
const { validateCreateReport, validateUpdateStatus } = require('../middleware/validator');
const { verifyToken, requireRole, optionalAuth } = require('../middleware/auth');

// 1. Crear nuevo reporte (sin imágenes) con límite de spam
router.post(
  '/',
  createReportLimiter,
  sanitizeMiddleware,
  validateCreateReport,
  reportController.create
);

// 2. Exportar listado a CSV (antes de la ruta dinámica /:code)
router.get('/export/csv', reportController.exportCsv);

// 2b. Reportes propios de ciudadano autenticado (token con DNI)
router.get('/mis-reportes', verifyToken, requireRole('ciudadano'), sanitizeMiddleware, reportController.listByDni);

// 3. Listar reportes con filtros y paginación
router.get('/', optionalAuth, sanitizeMiddleware, reportController.list);

// 4. Detalle de reporte por código (#REP-YYYY-XXXX)
router.get('/:code', optionalAuth, sanitizeMiddleware, reportController.getByCode);

// 5. Actualizar estado y cuadrilla (restringido a operadores/admin)
router.patch(
  '/:code/status',
  verifyToken,
  requireRole('admin', 'operador'),
  sanitizeMiddleware,
  validateUpdateStatus,
  reportController.updateStatus
);

// 6. Eliminar reporte del padrón (restringido a administradores)
router.delete(
  '/:code',
  verifyToken,
  requireRole('admin'),
  sanitizeMiddleware,
  reportController.delete
);

module.exports = router;
