const validator = require('validator');

const ALLOWED_INCIDENT_TYPES = [
  'alumbrado',
  'infraestructura',
  'limpieza',
  'seguridad',
  'ruidos',
  'arbolado',
  'pluvial',
  'otro'
];

const ALLOWED_STATUSES = ['pendiente', 'en_revision', 'en_proceso', 'resuelto'];

function validateCreateReport(req, res, next) {
  const errors = [];
  const { nombre_apellido, dni, tipo_incidente, direccion, descripcion } = req.body;

  if (!nombre_apellido || typeof nombre_apellido !== 'string' || nombre_apellido.trim().length < 2) {
    errors.push('El nombre y apellido es obligatorio.');
  }

  if (!dni) {
    errors.push('El DNI del solicitante es obligatorio.');
  } else {
    const cleanDni = dni.toString().replace(/\D/g, '');
    if (cleanDni.length < 6 || cleanDni.length > 9) {
      errors.push('El DNI debe contener entre 6 y 9 dígitos numéricos.');
    }
  }

  if (!tipo_incidente || !ALLOWED_INCIDENT_TYPES.includes(tipo_incidente.toLowerCase())) {
    errors.push(`El tipo de incidente no es válido. Opciones permitidas: ${ALLOWED_INCIDENT_TYPES.join(', ')}`);
  }

  if (!direccion || typeof direccion !== 'string' || direccion.trim().length < 2) {
    errors.push('La dirección exacta es requerida.');
  }

  if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length < 3) {
    errors.push('La descripción del incidente debe contener al menos 3 caracteres.');
  } else if (descripcion.trim().length > 500) {
    errors.push('La descripción no puede superar los 500 caracteres.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Error de validación en los datos del reporte',
      errors
    });
  }

  next();
}

function validateAddComment(req, res, next) {
  const { contenido } = req.body;

  if (!contenido || typeof contenido !== 'string' || contenido.trim().length < 2) {
    return res.status(400).json({
      status: 'error',
      message: 'El contenido del comentario o testimonio debe tener al menos 2 caracteres.'
    });
  }

  if (contenido.trim().length > 250) {
    return res.status(400).json({
      status: 'error',
      message: 'El testimonio no puede superar los 250 caracteres.'
    });
  }

  next();
}

function validateUpdateStatus(req, res, next) {
  const { estado } = req.body;

  if (!estado || !ALLOWED_STATUSES.includes(estado.toLowerCase())) {
    return res.status(400).json({
      status: 'error',
      message: `Estado no válido. Opciones: ${ALLOWED_STATUSES.join(', ')}`
    });
  }

  next();
}

function validateLogin(req, res, next) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Debe ingresar nombre de usuario y contraseña.'
    });
  }

  next();
}

module.exports = {
  validateCreateReport,
  validateAddComment,
  validateUpdateStatus,
  validateLogin,
  ALLOWED_INCIDENT_TYPES,
  ALLOWED_STATUSES
};
