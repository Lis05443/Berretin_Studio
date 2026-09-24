const express = require('express');
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/commentController');
const { commentLimiter } = require('../middleware/rateLimiter');
const sanitizeMiddleware = require('../middleware/sanitize');
const { validateAddComment } = require('../middleware/validator');

// Agregar testimonio o comentario vecinal a un reporte
router.post(
  '/',
  commentLimiter,
  sanitizeMiddleware,
  validateAddComment,
  commentController.addComment
);

module.exports = router;
