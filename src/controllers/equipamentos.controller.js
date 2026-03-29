const equipamentosService = require('../services/equipamentos.service');

function listar(req, res) {
  equipamentosService.listar((err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
}

function buscarPorId(req, res) {
  const { id } = req.params;

  // ======================================================
  // REGRA:
  // - Se vier número -> busca por ID
  // - Se vier texto -> considera como TAG
  // Isso mantém a rota atual /api/equipamentos/:id sem criar rota nova
  // ======================================================
  const ehNumero = /^\d+$/.test(String(id));

  if (ehNumero) {
    return equipamentosService.buscarPorId(id, (err, row) => {
      if (err) return res.status(500).json({ erro: err.message });
      if (!row) return res.status(404).json({ erro: 'Equipamento não encontrado.' });
      res.json(row);
    });
  }

  equipamentosService.buscarPorTag(id, (err, row) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!row) return res.status(404).json({ erro: 'Equipamento não encontrado.' });
    res.json(row);
  });
}

function criar(req, res) {
  equipamentosService.criar(req.body, (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({ mensagem: 'Equipamento criado com sucesso.', id: result.id });
  });
}

function editar(req, res) {
  const { id } = req.params;

  equipamentosService.editar(id, req.body, (err, changes) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (changes === 0) return res.status(404).json({ erro: 'Equipamento não encontrado.' });
    res.json({ mensagem: 'Equipamento atualizado com sucesso.' });
  });
}

function excluir(req, res) {
  const { id } = req.params;

  equipamentosService.excluir(id, (err, changes) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (changes === 0) return res.status(404).json({ erro: 'Equipamento não encontrado.' });
    res.json({ mensagem: 'Equipamento excluído com sucesso.' });
  });
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  editar,
  excluir
};