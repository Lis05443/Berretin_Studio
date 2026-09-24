/**
 * Utilidades de Privacidad y Cumplimiento de la Ley 25.326 (Protección de Datos Personales)
 * Enmascara identificadores personales en endpoints públicos de la plataforma ciudadana.
 */

function maskDNI(dni) {
  if (!dni) return '***.***';
  const clean = dni.toString().replace(/\D/g, '');
  if (clean.length >= 3) {
    const lastThree = clean.slice(-3);
    return `***.${lastThree}`;
  }
  return '***.***';
}

function maskName(fullName) {
  if (!fullName) return 'Vecino Anónimo';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

function maskContact(contact) {
  if (!contact) return null;
  // Si parece email
  if (contact.includes('@')) {
    const [user, domain] = contact.split('@');
    const maskedUser = user.length > 2 ? `${user.slice(0, 2)}***` : `${user.slice(0, 1)}***`;
    return `${maskedUser}@${domain}`;
  }
  // Si parece teléfono
  const clean = contact.replace(/\s+/g, '');
  if (clean.length > 6) {
    return clean.slice(0, clean.length - 4) + 'XXXX';
  }
  return '****-XXXX';
}

function sanitizeReportForPublic(report, isAuthorized = false) {
  if (!report) return null;

  if (isAuthorized) {
    // Operador autenticado o iniciador con clave de consulta: ve los datos completos
    return { ...report };
  }

  // Vista ciudadana abierta: Datos personales protegidos
  return {
    ...report,
    nombre_apellido: maskName(report.nombre_apellido),
    dni: maskDNI(report.dni),
    contacto: undefined, // Nunca exponer teléfono/email a terceros
    dni_masked: maskDNI(report.dni),
    solicitante_display: `${maskName(report.nombre_apellido)} (DNI ${maskDNI(report.dni)})`
  };
}

module.exports = {
  maskDNI,
  maskName,
  maskContact,
  sanitizeReportForPublic
};
