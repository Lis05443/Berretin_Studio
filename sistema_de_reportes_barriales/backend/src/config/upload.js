const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Se resuelve contra la carpeta backend (igual que en app.js), no contra el cwd
const uploadDir = path.resolve(__dirname, '../..', process.env.UPLOAD_DIR || 'uploads');

// Crear directorio de subidas seguro si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento en disco con nombres aleatorizados
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar un identificador aleatorio criptográficamente seguro
    const uniqueId = crypto.randomUUID();
    // Sanitizar y conservar extensión válida
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `evidencia_${uniqueId}${ext}`);
  }
});

// Filtro estricto de tipos de archivo permitidos (Whitelisting)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error('Formato de archivo no permitido. Solo se aceptan imágenes JPG, PNG o WEBP.');
    error.status = 400;
    return cb(error, false);
  }

  cb(null, true);
};

const maxSizeBytes = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10) * 1024 * 1024;

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSizeBytes, // 10MB máximo
    files: 1 // Máximo 1 archivo por formulario
  }
});

module.exports = upload;
