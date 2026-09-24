const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const sanitizeMiddleware = require('../middleware/sanitize');
const { validateLogin } = require('../middleware/validator');
const { verifyToken } = require('../middleware/auth');

router.post('/login', authLimiter, sanitizeMiddleware, validateLogin, authController.login);
router.get('/me', verifyToken, authController.profile);

// Login ciudadano por DNI (sin contraseña, valida que tenga reportes)
router.post('/citizen-login', authLimiter, sanitizeMiddleware, authController.citizenLogin);

module.exports = router;

