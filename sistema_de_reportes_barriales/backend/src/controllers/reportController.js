const reportService = require('../services/reportService');

class ReportController {
  async create(req, res, next) {
    try {
      const newReport = reportService.createReport(req.body, req.file);
      res.status(201).json({
        status: 'success',
        message: 'Reporte registrado exitosamente en el sistema municipal.',
        data: newReport
      });
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const { search, type, status, sort, page, limit } = req.query;
      const isAuthorized = !!req.user;

      const result = reportService.getReports({
        search,
        type,
        status,
        sort,
        page,
        limit,
        isAuthorized
      });

      res.status(200).json({
        status: 'success',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Devuelve los reportes propios del ciudadano autenticado (filtra por DNI del token).
   */
  async listByDni(req, res, next) {
    try {
      const citizenDni = req.user && req.user.dni;
      if (!citizenDni) {
        return res.status(403).json({ status: 'error', message: 'Token ciudadano inválido.' });
      }
      const result = reportService.getReports({
        dniExact: citizenDni,
        sort: 'recent',
        page: 1,
        limit: 200,
        // El resultado ya está limitado al DNI del token ciudadano.
        isAuthorized: true
      });
      res.status(200).json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  }

  async getByCode(req, res, next) {
    try {
      const code = req.params.code;
      const isAuthorized = !!req.user;

      // Un ciudadano autenticado solo puede abrir el detalle de un reporte
      // cuyo DNI coincida con el DNI de su sesión. Operadores/admin conservan
      // el acceso operativo completo.
      if (req.user?.role === 'ciudadano') {
        const ownerReport = reportService.getReportByCode(code, false);
        if (!ownerReport) {
          return res.status(404).json({
            status: 'error',
            message: `No se encontró ningún reporte con el código '${code}'.`
          });
        }
        const normalizedDni = String(ownerReport.dni || '').replace(/\D/g, '');
        if (normalizedDni !== String(req.user.dni || '').replace(/\D/g, '')) {
          return res.status(403).json({
            status: 'error',
            message: 'No tenés permisos para consultar este reporte.'
          });
        }
        return res.status(200).json({
          status: 'success',
          data: reportService.getReportByCode(code, true)
        });
      }

      const report = reportService.getReportByCode(code, isAuthorized);

      if (!report) {
        return res.status(404).json({
          status: 'error',
          message: `No se encontró ningún reporte con el código '${code}'.`
        });
      }

      res.status(200).json({
        status: 'success',
        data: report
      });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const code = req.params.code;
      const updated = reportService.updateStatus(code, req.body, req.user);

      if (!updated) {
        return res.status(404).json({
          status: 'error',
          message: `No se encontró ningún reporte con el código '${code}'.`
        });
      }

      res.status(200).json({
        status: 'success',
        message: `Estado del reporte ${code} actualizado correctamente.`,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async exportCsv(req, res, next) {
    try {
      const csvData = reportService.exportCSV();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="reportes_barriales.csv"');
      res.status(200).send('\uFEFF' + csvData); // BOM para compatibilidad con Excel
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const code = req.params.code;
      const deleted = reportService.deleteReport(code, req.user);

      if (!deleted) {
        return res.status(404).json({
          status: 'error',
          message: `No se encontró ningún reporte con el código '${code}'.`
        });
      }

      res.status(200).json({
        status: 'success',
        message: `El reporte ${code} fue eliminado exitosamente del padrón municipal.`
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportController();
