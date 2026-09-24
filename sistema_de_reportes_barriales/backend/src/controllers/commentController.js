const reportService = require('../services/reportService');

class CommentController {
  async addComment(req, res, next) {
    try {
      const code = req.params.code;
      const { autor, contenido, es_iniciador } = req.body;

      const updatedComments = reportService.addComment(code, {
        autor: autor || 'Vecino Participante',
        contenido,
        es_iniciador: Boolean(es_iniciador)
      });

      if (!updatedComments) {
        return res.status(404).json({
          status: 'error',
          message: `No se encontró el reporte con código '${code}'.`
        });
      }

      res.status(201).json({
        status: 'success',
        message: 'Aporte vecinal registrado correctamente en el expediente.',
        data: updatedComments
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CommentController();
