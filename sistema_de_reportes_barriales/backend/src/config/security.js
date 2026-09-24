const helmet = require('helmet');
const cors = require('cors');

// Configuración de CORS con listas de orígenes permitidos
const corsOptions = {
  origin: true, // Permitir cualquier origen local o web para desarrollo y pruebas
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  maxAge: 86400
};

// Configuración de Helmet con Content-Security-Policy permisiva para Google Maps y Tailwind
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:", "data:", "blob:"],
      frameSrc: ["'self'", "https://maps.google.com", "https://www.google.com", "https://*.google.com", "https://*.google.com.ar", "*"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://*.googleapis.com", "https://*.google.com", "*"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://*.googleapis.com", "*"],
      styleSrcAttr: ["'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com", "data:", "*"],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:",
        "http:"
      ],
      connectSrc: ["'self'", "http://localhost:3000", "http://127.0.0.1:3000", "https:", "http:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: null
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

module.exports = {
  corsMiddleware: cors(corsOptions),
  helmetMiddleware: helmetConfig
};
