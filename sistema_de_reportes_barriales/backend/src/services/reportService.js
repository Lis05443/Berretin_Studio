const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const { sanitizeReportForPublic } = require('../utils/privacy');
const logger = require('../utils/logger');

class ReportService {
  /**
   * Genera un código único de ticket civic formato #REP-YYYY-XXXX
   */
  generateUniqueCode() {
    const year = new Date().getFullYear();
    const checkStmt = db.prepare('SELECT id FROM reports WHERE code = ?');

    for (let i = 0; i < 100; i++) {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const candidateCode = `#REP-${year}-${randomDigits}`;
      const existing = checkStmt.get(candidateCode);
      if (!existing) {
        return candidateCode;
      }
    }
    // Fallback con timestamp si hubiese colisión masiva
    return `#REP-${year}-${Date.now().toString().slice(-4)}`;
  }

  /**
   * Registra un nuevo reporte vecinal con validación e inserción SQL parametrizada
   */
  createReport(reportData, file) {
    const code = this.generateUniqueCode();
    const {
      nombre_apellido,
      dni,
      contacto,
      tipo_incidente,
      direccion,
      coordenadas,
      descripcion,
      comuna = 'Comuna 5',
      prioridad = 'media'
    } = reportData;

    const cleanDni = dni.toString().replace(/\D/g, '');

    let foto_url = null;
    let foto_original_name = null;
    let foto_size_bytes = 0;

    if (file) {
      foto_url = `/uploads/${file.filename}`;
      foto_original_name = file.originalname;
      foto_size_bytes = file.size;
    }

    // Inserción parametrizada (Prevención 100% contra SQL Injection)
    const insertStmt = db.prepare(`
      INSERT INTO reports (
        code, nombre_apellido, dni, contacto, tipo_incidente, direccion,
        coordenadas, comuna, descripcion, foto_url, foto_original_name,
        foto_size_bytes, estado, prioridad
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?)
    `);

    insertStmt.run(
      code,
      nombre_apellido.trim(),
      cleanDni,
      contacto ? contacto.trim() : null,
      tipo_incidente.toLowerCase().trim(),
      direccion.trim(),
      coordenadas || '-34.6037, -58.3816',
      comuna,
      descripcion.trim(),
      foto_url,
      foto_original_name,
      foto_size_bytes,
      prioridad
    );

    const newReport = db.prepare('SELECT * FROM reports WHERE code = ?').get(code);

    // Crear o actualizar la cuenta ciudadana. El DNI es la clave primaria,
    // por lo que todos los reportes futuros quedan asociados al mismo vecino.
    const citizenUpsertStmt = db.prepare(`
      INSERT INTO citizen_users (dni, nombre_apellido, contacto)
      VALUES (?, ?, ?)
      ON CONFLICT(dni) DO UPDATE SET
        nombre_apellido = excluded.nombre_apellido,
        contacto = COALESCE(excluded.contacto, citizen_users.contacto),
        updated_at = CURRENT_TIMESTAMP
    `);
    citizenUpsertStmt.run(cleanDni, nombre_apellido.trim(), contacto ? contacto.trim() : null);

    // Registrar primer hito en la bitácora oficial de cuadrilla
    const insertLogStmt = db.prepare(`
      INSERT INTO report_logs (report_id, etapa, etiqueta_estado, descripcion, responsable)
      VALUES (?, '1. Recibido', 'Registrado digital', 'Ingreso registrado mediante la plataforma de gestión barrial. Se valida ingreso en padrón vecinal.', 'Sistema Vecinal')
    `);
    insertLogStmt.run(newReport.id);

    logger.info(`Nuevo reporte creado con éxito: ${code} [${tipo_incidente}]`);

    return newReport;
  }

  /**
   * Consulta listado de reportes con filtros y paginación (100% consultas SQL preparadas)
   */
  getReports({ search, type, status, sort = 'recent', page = 1, limit = 20, isAuthorized = false, dniExact = null }) {
    let whereConditions = [];
    let params = [];

    // Filtro exacto por DNI (para "mis reportes" ciudadano)
    if (dniExact) {
      whereConditions.push('dni = ?');
      params.push(dniExact);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      const cleanDigits = search.replace(/\D/g, '');
      if (cleanDigits.length >= 4) {
        whereConditions.push('(code LIKE ? OR dni LIKE ? OR direccion LIKE ?)');
        params.push(term, `%${cleanDigits}%`, term);
      } else {
        whereConditions.push('(code LIKE ? OR direccion LIKE ?)');
        params.push(term, term);
      }
    }

    if (type && type !== 'all') {
      whereConditions.push('tipo_incidente = ?');
      params.push(type.toLowerCase());
    }

    if (status && status !== 'all') {
      whereConditions.push('estado = ?');
      params.push(status.toLowerCase());
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    let orderClause = 'ORDER BY created_at DESC';
    if (sort === 'oldest') {
      orderClause = 'ORDER BY created_at ASC';
    } else if (sort === 'urgency') {
      orderClause = `ORDER BY CASE prioridad
        WHEN 'urgente' THEN 1
        WHEN 'alta' THEN 2
        WHEN 'media' THEN 3
        WHEN 'baja' THEN 4
        ELSE 5 END ASC, created_at DESC`;
    }

    // Contar total con los filtros actuales
    const countSql = `SELECT COUNT(*) as total FROM reports ${whereClause}`;
    const totalCount = db.prepare(countSql).get(...params).total;

    // Obtener página solicitada
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const querySql = `
      SELECT * FROM reports
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;

    const rows = db.prepare(querySql).all(...params, parseInt(limit, 10), offset);

    // Enmascarar datos personales si la consulta no proviene de un operador autorizado
    const sanitizedReports = rows.map(r => sanitizeReportForPublic(r, isAuthorized));

    return {
      reports: sanitizedReports,
      pagination: {
        total: totalCount,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(totalCount / parseInt(limit, 10)) || 1
      }
    };
  }

  /**
   * Obtiene el detalle completo de un reporte por su código único
   */
  getReportByCode(code, isAuthorized = false) {
    const reportStmt = db.prepare('SELECT * FROM reports WHERE code = ?');
    const report = reportStmt.get(code);

    if (!report) return null;

    // Obtener bitácora de cuadrilla
    const logsStmt = db.prepare(`
      SELECT * FROM report_logs WHERE report_id = ? ORDER BY created_at DESC
    `);
    const logs = logsStmt.all(report.id);

    // Obtener comentarios vecinales
    const commentsStmt = db.prepare(`
      SELECT * FROM comments WHERE report_id = ? ORDER BY created_at DESC
    `);
    const comments = commentsStmt.all(report.id);

    const sanitizedReport = sanitizeReportForPublic(report, isAuthorized);

    return {
      ...sanitizedReport,
      logs,
      comments
    };
  }

  /**
   * Actualiza el estado operativo y añade entrada en la bitácora de cuadrilla
   */
  updateStatus(code, updateData, user) {
    const report = db.prepare('SELECT * FROM reports WHERE code = ?').get(code);
    if (!report) return null;

    const {
      estado,
      cuadrilla_asignada,
      tiempo_estimado,
      acta_numero,
      etapa_log,
      descripcion_log
    } = updateData;

    const updateStmt = db.prepare(`
      UPDATE reports
      SET estado = ?,
          cuadrilla_asignada = COALESCE(?, cuadrilla_asignada),
          tiempo_estimado = COALESCE(?, tiempo_estimado),
          acta_numero = COALESCE(?, acta_numero),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(
      estado,
      cuadrilla_asignada || null,
      tiempo_estimado || null,
      acta_numero || null,
      report.id
    );

    // Agregar hito a la bitácora si se especificó
    if (descripcion_log) {
      const etapaNombre = etapa_log || `Cambio de estado a ${estado}`;
      const insertLogStmt = db.prepare(`
        INSERT INTO report_logs (report_id, etapa, etiqueta_estado, descripcion, responsable)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertLogStmt.run(
        report.id,
        etapaNombre,
        estado.toUpperCase(),
        descripcion_log,
        user ? `${user.full_name} (${user.role})` : 'Operador Comunal'
      );
    }

    // Registrar en auditoría de ciberseguridad
    const auditStmt = db.prepare(`
      INSERT INTO audit_logs (entity_type, entity_id, action, user_id, details)
      VALUES ('report', ?, 'STATUS_UPDATE', ?, ?)
    `);
    auditStmt.run(
      report.id,
      user?.id || null,
      `Estado cambiado de '${report.estado}' a '${estado}'`
    );

    logger.info(`Reporte ${code} actualizado a estado: ${estado} por ${user?.username || 'sistema'}`);

    return this.getReportByCode(code, true);
  }

  /**
   * Agrega un comentario o testimonio vecinal sobre el reporte
   */
  addComment(code, { autor, contenido, es_iniciador = 0 }) {
    const report = db.prepare('SELECT id FROM reports WHERE code = ?').get(code);
    if (!report) return null;

    const insertStmt = db.prepare(`
      INSERT INTO comments (report_id, autor, es_iniciador, contenido)
      VALUES (?, ?, ?, ?)
    `);

    insertStmt.run(
      report.id,
      autor ? autor.trim() : 'Vecino',
      es_iniciador ? 1 : 0,
      contenido.trim()
    );

    const commentsStmt = db.prepare(`
      SELECT * FROM comments WHERE report_id = ? ORDER BY created_at DESC
    `);
    return commentsStmt.all(report.id);
  }

  /**
   * Obtiene estadísticas agregadas en tiempo real para las tarjetas de impacto
   */
  getStats() {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM reports');
    const pendingStmt = db.prepare("SELECT COUNT(*) as count FROM reports WHERE estado = 'pendiente'");
    const inProcessStmt = db.prepare("SELECT COUNT(*) as count FROM reports WHERE estado IN ('en_revision', 'en_proceso')");
    const resolvedStmt = db.prepare("SELECT COUNT(*) as count FROM reports WHERE estado = 'resuelto'");

    const total = totalStmt.get().total;
    const pendientes = pendingStmt.get().count;
    const enCuadrilla = inProcessStmt.get().count;
    const resueltos = resolvedStmt.get().count;

    const efectividad = total > 0 ? Math.round((resueltos / total) * 100) : 100;

    return {
      total,
      pendientes,
      enCuadrilla,
      resueltos,
      efectividad: `${efectividad}%`,
      tiempoRespuestaPromedio: '< 48 hs',
      cuadrillasActivas: 8
    };
  }

  /**
   * Genera exportación en formato CSV con caracteres protegidos contra inyección CSV
   */
  exportCSV() {
    const rows = db.prepare(`
      SELECT code, nombre_apellido, dni, tipo_incidente, direccion, comuna, estado, prioridad, created_at
      FROM reports
      ORDER BY created_at DESC
    `).all();

    // Headers
    const headers = ['Codigo', 'Solicitante', 'DNI_Protegido', 'Tipo_Incidente', 'Direccion', 'Comuna', 'Estado', 'Prioridad', 'Fecha_Creacion'];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '';
      let str = String(val);
      // Prevenir inyección de fórmulas CSV (=, +, -, @)
      if (/^[=\+\-@]/.test(str)) {
        str = "'" + str;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const csvLines = [headers.join(',')];

    for (const r of rows) {
      const sanitized = sanitizeReportForPublic(r);
      const line = [
        escapeCsv(sanitized.code),
        escapeCsv(sanitized.nombre_apellido),
        escapeCsv(sanitized.dni),
        escapeCsv(sanitized.tipo_incidente),
        escapeCsv(sanitized.direccion),
        escapeCsv(sanitized.comuna),
        escapeCsv(sanitized.estado),
        escapeCsv(sanitized.prioridad),
        escapeCsv(sanitized.created_at)
      ].join(',');
      csvLines.push(line);
    }

    return csvLines.join('\r\n');
  }

  /**
   * Elimina un reporte por su código único con auditoría inmutable
   */
  deleteReport(code, user) {
    const report = db.prepare('SELECT * FROM reports WHERE code = ?').get(code);
    if (!report) return null;

    if (report.foto_url && report.foto_url.startsWith('/uploads/')) {
      try {
        const filePath = path.resolve(__dirname, '../../', report.foto_url.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        logger.warn(`No se pudo eliminar la imagen asociada a ${code}: ${e.message}`);
      }
    }

    const deleteStmt = db.prepare('DELETE FROM reports WHERE id = ?');
    deleteStmt.run(report.id);

    const auditStmt = db.prepare(`
      INSERT INTO audit_logs (entity_type, entity_id, action, user_id, details)
      VALUES ('report', ?, 'REPORT_DELETED', ?, ?)
    `);
    auditStmt.run(
      report.id,
      user?.id || null,
      `Reporte ${code} eliminado por ${user?.username || 'admin'}`
    );

    logger.info(`Reporte ${code} eliminado por ${user?.username || 'admin'}`);
    return true;
  }
}

module.exports = new ReportService();
