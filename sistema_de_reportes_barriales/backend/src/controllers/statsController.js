const reportService = require('../services/reportService');

class StatsController {
  async getMetrics(req, res, next) {
    try {
      const stats = reportService.getStats();
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StatsController();
