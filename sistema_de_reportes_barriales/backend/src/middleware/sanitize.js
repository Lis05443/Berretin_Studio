const validator = require('validator');

/**
 * Función recursiva de sanitización contra Cross-Site Scripting (XSS)
 * Elimina etiquetas HTML y caracteres potencialmente peligrosos de las cadenas de texto.
 */
function sanitizeValue(value) {
  if (typeof value === 'string') {
    // Eliminar etiquetas HTML sospechosas y caracteres nulos
    let clean = value.replace(/\0/g, '');
    clean = validator.escape(clean.trim());
    return clean;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (typeof value === 'object' && value !== null) {
    const sanitizedObj = {};
    for (const [key, val] of Object.entries(value)) {
      sanitizedObj[key] = sanitizeValue(val);
    }
    return sanitizedObj;
  }
  return value;
}

function sanitizeMiddleware(req, res, next) {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }
  next();
}

module.exports = sanitizeMiddleware;
