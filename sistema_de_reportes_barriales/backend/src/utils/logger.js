/**
 * Logger estructurado para eventos del sistema y alertas de seguridad.
 */

function formatTimestamp() {
  return new Date().toISOString();
}

const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] [${formatTimestamp()}] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] [${formatTimestamp()}] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  },
  error: (message, error = {}) => {
    console.error(`[ERROR] [${formatTimestamp()}] ${message}`, error?.message || error);
  },
  security: (action, details = {}) => {
    console.warn(`[SECURITY-ALERT] [${formatTimestamp()}] [${action}]`, JSON.stringify(details));
  }
};

module.exports = logger;
