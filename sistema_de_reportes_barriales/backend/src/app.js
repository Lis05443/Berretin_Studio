require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const { helmetMiddleware, corsMiddleware } = require('./config/security');
const { globalLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const reportRoutes = require('./routes/reportRoutes');
const commentRoutes = require('./routes/commentRoutes');
const authRoutes = require('./routes/authRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// 1. Capa de Seguridad HTTP (Helmet y CORS)
app.use(helmetMiddleware);
app.use(corsMiddleware);

// 2. Limitador global de peticiones (Protección contra DoS)
app.use('/api', globalLimiter);

// 3. Parsers de cuerpo de petición con límites estrictos de tamaño
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 4. Servir carpeta de subidas (con cabeceras de no ejecución para ciberseguridad)
const uploadsPath = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'");
  next();
}, express.static(uploadsPath));

// 5. Rutas de la API REST
app.use('/api/reports', reportRoutes);
app.use('/api/reports/:code/comments', commentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);

// Endpoint de diagnóstico de salud del sistema
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Sistema de Gestión de Reportes Barriales Comunal',
    db: 'SQL SQLite (WAL Mode Activo)'
  });
});

// 5.b. Documentación de la API (Swagger UI estático + especificación OpenAPI)
app.use('/docs', express.static(path.resolve(__dirname, '../docs')));

// 6. Servir únicamente el portal ciudadano desde /frontend.
const frontendBasePath = path.resolve(__dirname, '../../frontend');
app.use(express.static(frontendBasePath, { extensions: ['html'] }));

// Portal administrativo separado del frontend público.
// La URL no se publica en la interfaz ciudadana y las operaciones sensibles
// continúan protegidas por JWT + roles en la API.
const adminFrontendPath = path.resolve(__dirname, '../../admin_frontend/administrador.html');
app.get('/admin', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(adminFrontendPath);
});

// 7. Manejadores de rutas no encontradas y errores globales
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
