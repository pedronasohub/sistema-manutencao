const tecnicosService = require('../services/tecnicos.service');

function listar(req, res) {
  const { contrato_id, turno } = req.query;

  tecnicosService.listar({ contrato_id, turno }, (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
}

function buscarPorId(req, res) {
  const { id } = req.params;

  tecnicosService.buscarPorId(id, (err, row) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!row) return res.status(404).json({ erro: 'Técnico não encontrado.' });
    res.json(row);
  });
}

function criar(req, res) {
  const { matricula, nome, contrato_id, supervisor, turno } = req.body;

  tecnicosService.criar(
    { matricula, nome, contrato_id, supervisor, turno },
    (err, result) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.status(201).json({
        mensagem: 'Técnico criado com sucesso.',
        id: result.id
      });
    }
  );
}

function editar(req, res) {
  const { id } = req.params;
  const { matricula, nome, contrato_id, supervisor, turno } = req.body;

  tecnicosService.editar(
    id,
    { matricula, nome, contrato_id, supervisor, turno },
    (err, changes) => {
      if (err) return res.status(500).json({ erro: err.message });
      if (changes === 0) return res.status(404).json({ erro: 'Técnico não encontrado.' });
      res.json({ mensagem: 'Técnico atualizado com sucesso.' });
    }
  );
}

function excluir(req, res) {
  const { id } = req.params;

  tecnicosService.excluir(id, (err, changes) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (changes === 0) return res.status(404).json({ erro: 'Técnico não encontrado.' });
    res.json({ mensagem: 'Técnico excluído com sucesso.' });
  });
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  editar,
  excluir
};