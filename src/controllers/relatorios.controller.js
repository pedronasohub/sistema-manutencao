const relatoriosService = require('../services/relatorios.service');

function listarFiltrado(req, res) {
  const { dataInicio, dataFim, tecnico_id } = req.query;

  relatoriosService.listarFiltrado({ dataInicio, dataFim, tecnico_id }, (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
}

module.exports = {
  listarFiltrado
};