const atividadeCadastroService = require('../services/atividadeCadastro.service');

function listar(req, res) {
  atividadeCadastroService.listar((err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
}

function buscarPorId(req, res) {
  const { id } = req.params;

  atividadeCadastroService.buscarPorId(id, (err, row) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!row) return res.status(404).json({ erro: 'Atividade não encontrada.' });
    res.json(row);
  });
}

function criar(req, res) {
  const { codigo, nome, tipo, descricao } = req.body;

  atividadeCadastroService.criar({ codigo, nome, tipo, descricao }, (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({
      mensagem: 'Atividade criada com sucesso.',
      id: result.id
    });
  });
}

function editar(req, res) {
  const { id } = req.params;
  const { codigo, nome, tipo, descricao } = req.body;

  atividadeCadastroService.editar(id, { codigo, nome, tipo, descricao }, (err, changes) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (changes === 0) return res.status(404).json({ erro: 'Atividade não encontrada.' });
    res.json({ mensagem: 'Atividade atualizada com sucesso.' });
  });
}

function excluir(req, res) {
  const { id } = req.params;

  atividadeCadastroService.excluir(id, (err, changes) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (changes === 0) return res.status(404).json({ erro: 'Atividade não encontrada.' });
    res.json({ mensagem: 'Atividade excluída com sucesso.' });
  });
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  editar,
  excluir
};